<?php

namespace TheSceneman\SilverStripeGlossary\Tests;

use SilverStripe\Control\HTTPRequest;
use SilverStripe\Dev\FunctionalTest;
use TheSceneman\SilverStripeGlossary\Controllers\GlossaryController;

class GlossaryControllerTest extends FunctionalTest
{

    /**
     * Tests if API call gives status code 200 (OK response)
     */
    public function testGlossary()
    {
        $page = $this->get('api/glossary');

        $this->assertEquals(200, $page->getStatusCode());
    }

}
