<?php

namespace TheSceneman\SilverStripeGlossary\View;

use TheSceneman\SilverStripeGlossary\Model\GlossaryTerm;
use SilverStripe\ORM\FieldType\DBField;
use SilverStripe\ORM\FieldType\DBHTMLText;
use SilverStripe\View\ArrayData;
use SilverStripe\View\Parsers\ShortcodeHandler;

class GlossaryShortcodeProvider implements ShortcodeHandler
{
    /**
     * Gets the list of shortcodes provided by this handler
     *
     * @return mixed
     */
    public static function get_shortcodes()
    {
        return 'glossary_term';
    }

    /**
     * Replaces "[glossary_term id=n]" shortcode with frontend render
     *
     * @inheritDoc
     */
    public static function handle_shortcode($arguments, $content, $parser, $shortcode, $extra = []): string
    {
        if (!$arguments['id'] || !$content) {
            return '';
        }

        $termID = $arguments['id'];
        $glossaryTerm = GlossaryTerm::get()->byID($termID);

        // There's nothing to stop this term from being deleted, so first check that it still exists
        if (!$glossaryTerm) {
            return '';
        }

        $termDefinition = $glossaryTerm->Definition;
        if (!$termDefinition) {
            return '';
        }

        $data = [
            'Content' => DBField::create_field('HTMLFragment', $content),
            'Terminology' => DBHTMLText::create()->setValue($termDefinition),
        ];

        return ArrayData::create($data)->renderWith(self::class)->forTemplate();
    }
}
