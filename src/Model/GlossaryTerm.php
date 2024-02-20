<?php

namespace TheSceneman\SilverStripeGlossary\Model;

use SilverStripe\Forms\CompositeValidator;
use SilverStripe\Forms\FieldList;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Forms\RequiredFields;
use SilverStripe\ORM\DataObject;
use SilverStripe\Versioned\Versioned;

/**
 * @property string Title
 * @property string Definition
 * @mixin Versioned
 */
class GlossaryTerm extends DataObject
{
    private static string $table_name = 'Terminology';

    private static array $db = [
        'Title' => 'Varchar',
        'Definition' => 'HTMLText',
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
        $self = $this;

        $this->beforeUpdateCMSFields(static function ($fields) use ($self): void {
            $fields->removeByName('Definition');

            $fields->addFieldsToTab(
                'Root.Main',
                [
                    HTMLEditorField::create('Definition')->setEditorConfig(HTMLEditorConfig::get('glossary'))
                ]
            );
        });

        $fields = parent::getCMSFields();

        return $fields;
    }

    public function getCMSCompositeValidator(): CompositeValidator
    {
        $composite = parent::getCMSCompositeValidator();

        $requiredFields = [
            'Title',
            'Definition',
        ];

        $composite->addValidator(RequiredFields::create($requiredFields));

        return $composite;
    }

}
