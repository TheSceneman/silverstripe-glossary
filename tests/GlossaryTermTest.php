<?php

namespace TheSceneman\SilverStripeGlossary\Tests;

use SilverStripe\Dev\SapphireTest;
use SilverStripe\Forms\TextareaField;
use SilverStripe\Forms\TextField;
use TheSceneman\SilverStripeGlossary\Model\GlossaryTerm;

class GlossaryTermTest extends SapphireTest
{

    public function testGetCMSFields(): void
    {
        $obj = singleton(GlossaryTerm::class);

        assert($obj instanceof GlossaryTerm);
        $fields = $obj->getCMSFields();

        $expectedFieldCount = 2;

        $this->assertCount($expectedFieldCount, $fields->dataFieldNames());

        $expectedInstances = [
            'Title' => TextField::class,
            'Definition' => TextareaField::class,
        ];

        foreach ($expectedInstances as $key => $class) {
            $msg = 'The field'. $key .'should be an instance of'. $class .'::class';
            $this->assertInstanceOf($class, $fields->dataFieldByName($key), $msg);
        }
    }

}
