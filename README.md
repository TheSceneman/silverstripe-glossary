# Silverstripe Glossary

Adds a Glossary section to CMS admin where glossary terms can be defined. These terms can then be added to content via
the WYSIWYG and the definitions will be rendered as interactive rollovers within webpage content.

Thanks to @MelissaWu-SS for writing the code that was the basis for this module

## Requirements

* SilverStripe ^4.0
* PHP ^7.3

## Installation
```
composer require thesceneman/silverstripe-glossary
```
## Usage
After running composer run the usual `vendor/bin/sake dev/build`


This will add the Glossary section to the CMS admin: <br>
<img width="559" alt="Glossary admin" src="https://user-images.githubusercontent.com/88803020/148464039-1e72d10f-a40b-4081-a312-5cb8f4fd3a1b.png">


Here we can add glossary terms via standard gridfield. I've added some sample data in this example: <br>
<img width="1463" alt="Glossary admin data" src="https://user-images.githubusercontent.com/88803020/148464674-7dedeb22-873a-479e-89c6-bf61d464444a.png">


Now, we can add these terms to our WYSIWG markup. Select the word you'd like to apply the definition to, click the "Glossary" button, and choose the appropriate definition: <br>
<img width="563" alt="Adding glossary term to markup" src="https://user-images.githubusercontent.com/88803020/148465367-02e61452-cd18-41fb-b2f2-f5d97061249d.png"> <br>
<img width="627" alt="Selecting glossary term" src="https://user-images.githubusercontent.com/88803020/148465492-74585acb-3250-41b7-b999-31c089befc32.png">


And finally here is the marked up content on a webpage (displayed at cursor hover state): <br>
<img width="780" alt="Glossary frontend" src="https://user-images.githubusercontent.com/88803020/148470238-8fcd316f-75b7-437d-b761-4f7c67b1c21d.png">


## Customising the frontend
This module comes with a very basic frontend implementation out of the box and you'll likely want to change this to match your application. You may opt to keep the purely CSS rollover functionality and write some new CSS for the classes `.inline-glossary-term` and `.inline-glossary-definition`.

Alternatively you can overload the template at `TheSceneman\SilverStripeGlossary\View\GlossaryShortcodeProvider.ss` and use whatever markup and or Javascript components you'd like.

## Maintainers
 * Adrian Jimson <adrian.jimson@silverstripe.com>

## Development and contribution
If you would like to make contributions to the module please ensure you raise a pull request and discuss with the module maintainers.
