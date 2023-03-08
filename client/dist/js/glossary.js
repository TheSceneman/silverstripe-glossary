/**
 * The code of this shortCodeParse helper is mostly copied from
 * https://github.com/silverstripe/silverstripe-admin/blob/1/client/src/lib/ShortcodeSerialiser.js
 */
// Used to match outer regexp and get attrs as a string
// All attrs extracted into matches[1]
const stringifyRegex = (regexp) => (regexp.toString().slice(1, -1));
const SHORTCODE_ATTRS = stringifyRegex(
  /((?:[,\s]+(?:[a-z0-9\-_]+)=(?:(?:[a-z0-9\-_]+)|(?:\d+\.\d+)|(?:'[^']*')|(?:"[^"]*")))*)/
);
// Used to extract individual items from above regexp
// Each item matches[1] is key, and matches[2] || matches[3] || matches[4] || matches[5] is value
// eslint-disable-next-line max-len
const SHORTCODE_ATTR = /[,\s]+([a-z0-9\-_]+)=(?:([a-z0-9\-_]+)|(\d+\.\d+)|(?:'([^']*)')|(?:"([^"]*)"))/;
const SHORTCODE_OPEN = stringifyRegex(/\[%s/);
const SHORTCODE_RIGHT_BRACKET = '\\]';
const SHORTCODE_CLOSE = stringifyRegex(/\[\s*\/\s*%s\s*]/);
const SHORTCODE_CONTENT = stringifyRegex(/((?:.|\n|)*?)/);
const SHORTCODE_SPACE = stringifyRegex(/\s*/);

/**
 * Substitutes %s with parameter
 * given in list. %%s is used to escape %s.
 *
 * @param {String} - The string to perform the substitutions on.
 * @return {String} - The new string with substitutions made.
 */
const sprintf = (s, param) => {
  if (!param) {
    return s;
  }

  const regx = new RegExp('(.?)(%s)', 'g');

  return s.replace(regx, (match, subMatch1) => {
    // skip %%s
    if (subMatch1 === '%') {
      return match;
    }

    return subMatch1 + param;
  });
}

const shortCodeParser = {
  /**
   * Matches the next occurance of a shortcode in a string.
   *
   * Returns object with keys:
   *  - name (tag name)
   *  - original (original matched string)
   *  - properties (key-value pair of properties)
   *  - content (between open / close tags)
   *  - wrapped (bool flag)
   *
   * @param {String} name - shortcode tag
   * @param {Boolean} wrapped - Expect a closing tag? ([tag][/tag]) or simple tag ([tag])
   * @param {String} content - string to parse
   * @return {Object} Object, or null if not found
   */
  match(name, wrapped, content) {
    // Build matching regexp
    const open = sprintf(SHORTCODE_OPEN, name);
    let pattern = `${open}${SHORTCODE_ATTRS}${SHORTCODE_SPACE}${SHORTCODE_RIGHT_BRACKET}`;
    if (wrapped) {
      pattern = `${pattern}${SHORTCODE_CONTENT}${sprintf(SHORTCODE_CLOSE, name)}`;
    }

    // Get next match
    const regex = new RegExp(pattern, 'i');
    const match = regex.exec(content);
    if (!match) {
      return null;
    }

    // parse attributes
    const properties = this.parseProperties(match[1]);
    return {
      name,
      wrapped,
      properties,
      original: match[0],
      content: wrapped ? match[2] : null,
    };
  },

  /**
   * Parse shortcode props from string
   *
   * @param {String} input
   * @return {Object}
   */
  parseProperties(input) {
    let unmatched = input;
    const result = {};
    let match = unmatched.match(SHORTCODE_ATTR);
    while (match) {
      // Save key / value
      const key = match[1] || '';
      const value = match[2] || match[3] || match[4] || match[5] || '';
      if (key) {
        result[key] = value;
      }

      // Trim off matched content from unmatched and continue parsing
      const idx = unmatched.indexOf(match[0]);
      unmatched = unmatched.substr(idx + match[0].length);
      match = unmatched.match(SHORTCODE_ATTR);
    }
    return result;
  },

  /**
   * Turn shortcode object into string.
   * Note that if a shortcode is placed into a html attribute, use attributesafe to true to
   * use attribute protected characters. For example:
   *  - [sitetree_link id="3"] (attributesafe = false)
   *  - [sitetree_link,id='3'] (attributesafe = true)
   *
   * Note that special characters (e.g. quotes) will be stripped if they would otherwise
   * break the shortcode.
   *
   * @param {Object} object - Object in same format as match() (original ignored)
   * @param {Boolean} attributesafe - Set to true to encode in attribute safety mode
   * @return {String}
   */
  serialise(object, attributesafe = false) {
    // attributesafe can only encode alphanumeric characters
    const rule = attributesafe
      ? { sep: ',', quote: '', replacer: /[^a-z0-9\-_.]/gi }
      : { sep: ' ', quote: '"', replacer: /"/g };
    const attrs = Object.entries(object.properties)
      .map(([name, value]) => ((value)
          ? `${rule.sep}${name}=${rule.quote}${`${value}`.replace(rule.replacer, '')}${rule.quote}`
          : null
      ))
      .filter((attr) => attr !== null)
      .join('');

    if (object.wrapped) {
      return `[${object.name}${attrs}]${object.content}[/${object.name}]`;
    }
    return `[${object.name}${attrs}]`;
  },
};

const createHTMLSanitiser = () => {
  const div = document.createElement('div');
  return (str) => {
    if (str === undefined) {
      return '';
    }

    div.textContent = str;

    return div.innerHTML;
  };
};

const sanitiseShortCodeProperties = (rawProperties) => {
  const sanitise = createHTMLSanitiser();
  return Object.entries(rawProperties).reduce((props, [name, value]) => ({
    ...props,
    [name]: sanitise(value)
  }), {});
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
      size: 'normal',
      // Add a listbox(dropdown list) to the modal, it enables us to select a terminology
      body: {
        type: 'panel',
        items: [
          {
            type: "listbox",
            name: "glossary",
            label: "Glossary",
            items: data,
          },
        ]
      },
      buttons: [
        {
          type: 'submit',
          text: 'OK'
        },
        {
          type: 'cancel',
          text: 'Cancel'
        }
      ],
      // Submit event handler. It will be triggered when the 'OK' button is clicked.
      // It gets the selected terminology id and insert it to the selected text in the format of the example code:
      // <span data-shortcode="glossary_term" data-id="1">public cloud</span>
      onSubmit(dialogApi) {
        const termID = dialogApi.getData().glossary;
        // The selected text to be inserted a terminology
        const selectedText = editor.selection.getNode().innerText;
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
    editor.ui.registry.addButton("ssglossary", {
      tooltip: "Insert terminology",
      text: "Glossary",
      onAction: function () {
        editor.execCommand("ssglossary");
      },
    });

    // Define the 'ssglossary' command, which will be triggered when the Glossary plugin button is clicked
    editor.addCommand("ssglossary", () => {
      editor.setProgressState(1);
      // Fetch the glossary data. If it succeeds, open the Glossary modal, otherwise, show error alert
      fetch("./glossary-api/glossary")
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
      const content = parser.parseFromString(o.content, "text/html");
      const filter = `span[data-shortcode="glossary_term"]`;
      const elementList = content.querySelectorAll(filter);

      if (elementList.length === 0) {
        return;
      }

      elementList.forEach((element) => {
        if (!element.innerHTML) {
          return;
        }

        const termID = element.getAttribute("data-id");
        const properties = sanitiseShortCodeProperties({
          id: termID
        });
        // const shortcode = `[glossary_term id="${termID}"]${element.innerHTML}[/glossary_term]`;
        const shortcode = shortCodeParser.serialise({
          name: 'glossary_term',
          properties,
          wrapped: true,
          content: element.innerHTML
        });
        element.replaceWith(shortcode);
      });

      o.content = content.body.innerHTML;
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
      let match = shortCodeParser.match('glossary_term', true, content);
      // Transform the shortcodes to html '<span>...</span>'
      while (match) {
        const { original, properties } = match;
        // Transform the shortcode to raw html
        const raw = `<span data-shortcode="glossary_term" data-id="${properties.id}">${match.content}</span>`;
        content = content.replace(original, raw);
        match = shortCodeParser.match('glossary_term', true, content);
      }
      o.content = content;
    });
  };

  // Add the Glossary plugin to Tinymce editor
  tinymce.PluginManager.add("glossary", function(editor, url) {
    ssglossary(editor);
  });
})();
