import run_accessibility from '../../utils/run_accessibility';
import { deleteExistingTestApplication } from '../../utils/deleteApplications';
import createTestApplication from '../../utils/createTestApplication';
describe('Customise Application', () => {
  const applicationName = 'A testing application';
  before(() => {
    cy.session('Custom application', () => {
      cy.visit('/');
    });
    cy.visit('/');

    deleteExistingTestApplication();
    createTestApplication(applicationName);
  });

  after(() => {
    deleteExistingTestApplication();
  });

  it('Should allow admins to add new custom questions to application form.', () => {
    //create a section
    cy.get('[data-cy="cy-button-addNewSection"]')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', 'section-name');
    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('input').eq(0).type('Custom section');
    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);
    //add a check if custom sextion has been added

    cy.get('[data-cy="cy_addAQuestion-Custom section"]')
      .contains('Add a question')
      .click();
    //Submit form without values
    cy.url().should('include', 'question-content');
    cy.get('[data-cy="cy-question-page-caption-Custom section"]').contains(
      'Custom section'
    );

    cy.get('[data-cy="cy-fieldTitle-text-input"]').should('have.value', '');
    cy.get('textarea').should('have.value', '');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');

    // cy.get('[type="radio"]').).should('be.checked');

    cy.get('[data-cy="cy-button-Save and continue"]')
      .contains('Save and continue')
      .click();
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    //run accessibility with errors on page
    run_accessibility();

    //check blank validation messages (name and mandatory)
    cy.get('[data-cy="cyError_fieldTitle"]')
      .contains('Question title can not be less than 2 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'fieldTitle');
    //check question title with 250+ characters
    cy.get('[data-cy="cy-fieldTitle-text-input"]')
      .should('have.value', '')
      .click()
      .type('a'.repeat(256), { delay: 0 });
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_fieldTitle"]')
      .contains('Question title can not be greater than 255 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'fieldTitle');
    cy.get('[data-cy="cy-fieldTitle-text-input"]')
      .click()
      .clear()
      .type('valid question title');
    //check description with 1000+ characters

    cy.get('textarea')
      .should('have.value', '')
      .click()
      .type('a'.repeat(1001), { delay: 0 });
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_hintText"]')
      .contains('Question hint can not be greater than 1000 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'hintText');
    run_accessibility();
    //submit with valid test data
    cy.get('textarea').click().clear().type('valid description data');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('h1').contains('How would you like this question to be answered?');
    cy.url().should('include', 'question-type');
    //check data retention
    cy.get('[data-cy="cy_questionType-page-back-button"]').click();
    cy.url().should('include', 'question-content');

    cy.get('textarea').should('have.value', 'valid description data');
    cy.get('[data-cy="cy-fieldTitle-text-input"]').should(
      'have.value',
      'valid question title'
    );
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-button-Save and continue"]')
      .contains('Save and continue')
      .click();

    //run accessibility on question type
    cy.url().should('include', 'question-type');
    run_accessibility();

    //submit page without selecting response type
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    //check no response type error

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_responseType"]')
      .contains('Select a question type')
      .click();

    //run accesssibility with validation errors on page
    run_accessibility();

    //choose response type
    cy.get('[data-cy="cy-radioInput-option-ShortAnswer"]').check();
    //submit question
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //verify question is on dashboard
    cy.get('[data-cy="cy-table-caption-1. Eligibility"]').should(
      'contain',
      '1. Eligibility'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-0"]').should(
      'contain',
      'Eligibility Statement'
    );

    cy.get('[data-cy="cy-table-caption-2. Required checks"]').should(
      'contain',
      '2. Required checks'
    );

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-0"]'
    ).should('contain', 'Due-diligence checks');

    cy.get('[data-cy="cy-table-caption-3. Custom section"]').contains(
      '3. Custom section'
    );
    cy.get(
      '[data-cy="cy_table_row-for-3. Custom section-row-0-cell-0"]'
    ).should('contain', 'valid question title');

    cy.get('h1').contains('Build an application form');
  });
});
