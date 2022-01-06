const shortcodeAttrPattern = /[,\s]+([a-z0-9\-_]+)=(?:([a-z0-9\-_]+)|(\d+\.\d+)|(?:'([^']*)')|(?:"([^"]*)"))/;
/**
 * Parse the shortcode properties
 * @param input The properties in shortcode need to be parsed
 * @returns {{}}
 */
const parseProperties = (input) => {
  let unmatched = input;
  const result = {};
  let match = unmatched.match(shortcodeAttrPattern);
  while (match) {
    // Save key / value
    const key = match[1] || "";
    const value = match[2] || match[3] || match[4] || match[5] || "";
    if (key) {
      result[key] = value;
    }

    // Trim off matched content from unmatched and continue parsing
    const idx = unmatched.indexOf(match[0]);
    unmatched = unmatched.substr(idx + match[0].length);
    match = unmatched.match(shortcodeAttrPattern);
  }
  return result;
};

/**
 * Match the [glossary_term] shortcode
 * @param content The content from the active editor
 * @returns Properties and content in the shortcode, and the original shortcode
 */
const matchShortcode = (content) => {
  // Build matching regexp
  const pattern = /\[glossary_term\sid="[0-9]+"\]([A-Za-z0-9\.\-\s_]+)\[\/glossary_term\]/; // eslint-disable-line

  // Get next match
  const regex = new RegExp(pattern, "i");
  const match = regex.exec(content);
  if (!match) {
    return null;
  }

  // Parse properties in the shortcode
  const properties = parseProperties(match[0]);
  return {
    properties,
    textContent: match[1],
    original: match[0],
  };
};

/**
 * Create a custom Glossary plugin and add it to WYSIWYG field
 * When this plugin is clicked, a glossary modal will pop up, the modal consists of a listbox and two control buttons
 */
(() => {
  /**
   * The glossary modal for inserting terminology
   * @param editor The active tinymce editor instance
   * @param data The glossary data
   */
  const glossaryModal = (editor, data) => {
    editor.windowManager.open({
      title: "Glossary",
      width: 330,
      height: 70,
      // Add a listbox(dropdown list) to the modal, it enables us to select a terminology
      body:
        [
          {
            type: "listbox",
            name: "glossary",
            label: "Glossary",
            values: data,
          },
        ],
      // Submit event handler. It will be triggered when the 'OK' button is clicked.
      // It gets the selected terminology id and insert it to the selected text in the format of the example code:
      // <span data-shortcode="glossary_term" data-id="1">public cloud</span>
      onSubmit(v) {
        const termID = v.data.glossary;
        // The selected text to be inserted a terminology
        const selectedText = editor.selection.getContent();
        // No text was selected
        if (!selectedText) {
          return;
        }
        const newText = `<span data-shortcode="glossary_term" data-id="${termID}">${selectedText}</span>`;
        editor.insertContent(newText);
      },
    });
  };

  /**
   * Create a Glossary plugin
   * @param editor The active tinymce editor instance
   */
  const ssglossary = (editor) => {
    // Add the plugin button to WYSIWYG field
    editor.addButton("ssglossary", {
      tooltip: "Insert terminology",
      text: "Glossary",
      cmd: "ssglossary",
    });

    // Define the 'ssglossary' command, which will be triggered when the Glossary plugin button is clicked
    editor.addCommand("ssglossary", () => {
      editor.setProgressState(1);
      // Fetch the glossary data. If it succeeds, open the Glossary modal, otherwise, show error alert
      fetch("http://adrian.sandbox/api/glossary")
        .then(
          (response) => {
            if (response.status !== 200) {
              editor.setProgressState(0);
              throw new Error(`Failed to fetch glossary.`);
            }
            editor.setProgressState(0);
            return response.json();
          }
        )
        .then (data => glossaryModal(editor, data))
        // eslint-disable-next-line no-alert
        .catch ((error) => alert(error));
    });

    /**
     * SaveContent event handler. It fires after contents have been saved from the editor
     * We want to save the content with inserted glossary term to db in the format of Shortcodes for further process
     * so we transform the
     * '<span data-shortcode="glossary_term" data-id="1">public cloud</span>' to
     * '[glossary_term id="1"]public cloud[/glossary_term]'
     * See more about Shortcodes here: https://docs.silverstripe.org/en/4/developer_guides/extending/shortcodes/
     */
    editor.on("SaveContent", (o) => {
      const parser = new DOMParser();
      const content = parser.parseFromString(`<div>${o.content}</div>`, "text/xml");
      const filter = `span[data-shortcode="glossary_term"]`;
      const elementList = content.querySelectorAll(filter);

      if (elementList.length === 0) {
        return;
      }

      elementList.forEach((element) => {
        if (element.length === 0) {
          return;
        }

        const termID = element.getAttribute("data-id");
        const shortcode = `[glossary_term id="${termID}"]${element.innerHTML}[/glossary_term]`;
        element.replaceWith(shortcode);
      });

      o.content = content.firstChild.innerHTML;
    });

    /**
     * BeforeSetContent even handler. It fires before the contents is set to the editor.
     * Since we have saved the content to db in the format of Shortcodes, which is not standard HTML that can be
     * rendered in WYSIWYG so we need to transform all [glossary_term] shortcodes back to raw html for showing up in
     * the WYSIWYG field
     */
    editor.on("BeforeSetContent", (o) => {
      let {content} = o;
      // Match [glossary_term] shortcodes
      let match = matchShortcode(content);
      // Transform the shortcodes to html '<span>...</span>'
      while (match) {
        const { original, properties, textContent } = match;
        // Transform the shortcode to raw html
        const raw = `<span data-shortcode="glossary_term" data-id="${properties.id}">${textContent}</span>`;
        content = content.replace(original, raw);
        match = matchShortcode(content);
      }
      o.content = content;
    });
  };

  // Add the Glossary plugin to Tinymce editor
  tinymce.PluginManager.add("glossary", function(editor, url) {
    ssglossary(editor);
  });
})();
