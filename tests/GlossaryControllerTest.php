<?php

namespace TheSceneman\SilverStripeGlossary\Tests;

use SilverStripe\Dev\FunctionalTest;
use SilverStripe\Security\Member;

class GlossaryControllerTest extends FunctionalTest
{

    /**
     * @inheritDoc
     */
    protected static $fixture_file = '/tests/fixtures/Member.yml';

    /**
     * Tests that the API returns a 403 status code when the user is not logged in
     */
    public function testGlossaryNotLoggedIn(): void
    {
        $page = $this->get('glossary-api/glossary/');

        $this->assertEquals(403, $page->getStatusCode());
    }

    /**
     * Tests that the API will only return the 200 response when the user is a logged in CMS user
     */
    public function testGlossaryLoggedIn(): void
    {
        $loggedInUser = $this->objFromFixture(Member::class, 'content-author');
        $this->logInAs($loggedInUser);

        $page = $this->get('glossary-api/glossary/');
        $this->assertEquals(200, $page->getStatusCode());
    }

}
