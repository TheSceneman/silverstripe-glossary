<?php

namespace TheSceneman\SilverStripeGlossary\Admin;

use SilverStripe\Admin\ModelAdmin;
use SilverStripe\Forms\GridField\GridFieldConfig;
use SilverStripe\Forms\GridField\GridFieldExportButton;
use SilverStripe\Forms\GridField\GridFieldImportButton;
use SilverStripe\Forms\GridField\GridFieldPrintButton;
use Symbiote\GridFieldExtensions\GridFieldOrderableRows;
use TheSceneman\SilverStripeGlossary\Model\GlossaryTerm;

class GlossaryAdmin extends ModelAdmin
{
    private static string $url_segment = 'glossary';

    private static string $menu_icon_class = 'font-icon-p-a';

    private static string $menu_title = 'Glossary';

    private static array $managed_models = [
        GlossaryTerm::class,
    ];

    public function getEditForm($id = null, $fields = null) // phpcs:ignore SlevomatCodingStandard.TypeHints
    {
        $form = parent::getEditForm($id, $fields);

        if (class_exists(GridFieldOrderableRows::class)) {
            $gridFieldName = $this->sanitiseClassName($this->modelClass);
            $gridField = $form->Fields()->fieldByName($gridFieldName);

            /** @var GridFieldConfig $config */
            $config = $gridField->getConfig();
            $config->removeComponentsByType(GridFieldExportButton::class);
            $config->removeComponentsByType(GridFieldPrintButton::class);
            $config->removeComponentsByType(GridFieldImportButton::class);
        }

        return $form;
    }
}
