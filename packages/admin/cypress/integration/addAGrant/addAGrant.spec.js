import run_accessibility from '../../utils/run_accessibility';
import deleteTestSchemes from '../../utils/deleteTestSchemes';

describe('dashboard', () => {
  beforeEach(() => {
    cy.session('Add a grant', () => {
      cy.visit('/');
    });
    deleteTestSchemes('QA Test Scheme');

    cy.visit('/');
  });

  after(() => {
    deleteTestSchemes('QA Test Scheme');
  });
  it('should allow grant to be added for the full add a grant journey', () => {
    //Scehme
    cy.get('[data-cy="cy_addAGrantButton"')
      .should('contain', 'Add a grant')
      .click();
    cy.url().should('include', 'new-scheme/name');
    cy.get('h1').contains('What is the name of your grant?');

    run_accessibility();

    //Scheme name validation
    cy.get('[data-cy="cy-button-Save and continue"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    run_accessibility();

    cy.get('[data-cy="cyError_name"]')
      .contains('Enter the name of your grant')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'name');
    cy.get('[data-cy="cy-name-text-input"]').type('QA Test');

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //Scheme name session checker
    cy.get('h1').contains('Enter your GGIS Scheme Reference Number');
    cy.get('[data-cy="cy_GGISQuestionPageBackButton"]')
      .contains('Back')
      .click();

    cy.url().should('include', 'new-scheme/name');
    cy.get('input').should('have.attr', 'value').and('eq', 'QA Test');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //GGIS
    cy.url().should('include', 'new-scheme/ggis-reference');
    run_accessibility();

    //GGIS validation
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    run_accessibility();

    cy.get('[data-cy="cyError_ggisReference"]')
      .contains('Enter your GGIS Scheme Reference Number')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'ggisReference');

    cy.get('[data-cy="cy-ggisReference-text-input"]').type('123456789');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('include', 'new-scheme/email');
    run_accessibility();

    //GGIS session checker
    cy.get('[data-cy="cy_emailQuestionPageBackButton"]')
      .contains('Back')
      .click();

    cy.url().should('include', 'new-scheme/ggis-reference');
    cy.get('input').should('have.attr', 'value').and('eq', '123456789');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //email
    cy.get('h1').contains(
      'Enter the email address you want to use for support'
    );
    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //summary page
    cy.get('h1').contains('Check and confirm the details of your grant');
    run_accessibility();

    cy.get('[data-cy="cy_summaryListValue_Grant name"]').contains('QA Test');
    cy.get(
      '[data-cy="cy_summaryListValue_GGIS Scheme Reference Number"]'
    ).contains('123456789');
    cy.get('[data-cy="cy_summaryListValue_Support email address"]').should(
      'have.value',
      ''
    );

    //change scheme name
    cy.get('[data-cy="cy_summaryListLink_Change scheme name"]').click();
    cy.get('input').should('have.attr', 'value').and('eq', 'QA Test');

    cy.get('[data-cy="cy-name-text-input"]')
      .clear()
      .click()
      .type('QA Test Scheme');

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //change GGIS number
    cy.get(
      '[data-cy="cy_summaryListLink_Change scheme GGIS reference"]'
    ).click();

    cy.get('[data-cy="cy-ggisReference-text-input"]').should(
      'have.value',
      '123456789'
    );
    cy.get('[data-cy="cy-ggisReference-text-input"]')
      .clear()
      .click()
      .type('1234567890');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //change email
    cy.get(
      '[data-cy="cy_summaryListLink_Change scheme contact email address"]'
    ).click();

    cy.get('[data-cy="cy-contactEmail-text-input"]').should('have.value', '');

    cy.get('[data-cy="cy-contactEmail-text-input"]').type('dummyEmail');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //email validation
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    run_accessibility();

    cy.get('[data-cy="cyError_contactEmail"]')
      .contains(
        'Enter an email address in the correct format, like name@example.com'
      )
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'contactEmail');
    cy.get('[data-cy="cy-contactEmail-text-input"]')
      .should('have.attr', 'value')
      .and('eq', 'dummyEmail');
    cy.get('[data-cy="cy-contactEmail-text-input"]').click().type('@test.com');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    // //summary page

    cy.get('[data-cy="cy_summaryListValue_Grant name"]').contains(
      'QA Test Scheme'
    );
    cy.get(
      '[data-cy="cy_summaryListValue_GGIS Scheme Reference Number"]'
    ).contains('1234567890');
    cy.get('[data-cy="cy_summaryListValue_Support email address"]').contains(
      'dummyEmail@test.com'
    );

    cy.get('[data-cy="cy_addAGrantConfirmationPageButton"')
      .contains('Confirm')
      .click();

    // dashboard

    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cy_dashboardPageTitle"]').contains('Manage a grant');
    cy.wait(2000);
    cy.get('[data-cy="cy_SchemeListButton"]').click();

    cy.get('[data-cy="cy_linkToScheme_QA Test Scheme"]').should('exist');
  });
});
