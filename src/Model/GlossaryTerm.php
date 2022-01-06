<?php

namespace TheSceneman\SilverStripeGlossary\Model;

use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\TextareaField;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

/**
 * @property string Title
 * @property string Definition
 */
class GlossaryTerm extends DataObject
{
    private static string $table_name = 'Terminology';

    private static array $db = [
        'Title' => 'Varchar',
        'Definition' => 'Varchar',
    ];

    private static array $extensions = [
        Versioned::class,
    ];

    private static string $default_sort = 'Title';

    private static array $summary_fields = [
        'Title' => 'Title',
        'Definition' => 'Definition',
    ];

    public function getCMSFields(): FieldList
    {
        $fields = parent::getCMSFields();

        $fields->removeByName('Definition');

        $fields->addFieldsToTab('Root.Main', [TextareaField::create('Definition')]);

        return $fields;
    }
}
