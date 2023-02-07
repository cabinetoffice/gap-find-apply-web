import {
  EXCESSIVE_CHARACTER_EMAIL,
  EXCESSIVE_CHARACTER_STRING,
} from '../../constants/constants';
import createTestScheme from '../../utils/createTestScheme';
import deleteTestSchemes from '../../utils/deleteTestSchemes';
import run_accessibility from '../../utils/run_accessibility';
describe('View/Edit a grant', () => {
  before(() => {
    cy.session('View/Edit a grant', () => {
      cy.visit('/');
    });
    cy.visit('/');

    deleteTestSchemes('QA Test Scheme');
    createTestScheme('QA Test Scheme');
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="cy_SchemeListButton"]').click();
    cy.url().should('include', '/scheme-list');
    cy.get('[data-cy="cy_linkToScheme_QA Test Scheme"]')
      .should('exist')
      .click();
  });

  after(() => {
    deleteTestSchemes('QA Test Scheme');
  });

  it('should allow grant to be viewed', () => {
    //start test here
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'QA Test Scheme'
    );
    run_accessibility();

    cy.get(
      '[data-cy="cy_summaryListValue_GGIS Scheme Reference Number"]'
    ).contains('1234567890');

    cy.get('[data-cy="cy_summaryListValue_Support email address"]').contains(
      'dummy@test.com'
    );
  });
  it('should allow GGIS to be edited', () => {
    // Editing the GGIS number and checking validation
    cy.get('[data-cy="cy_Change GGIS scheme reference number"]')
      .contains('Change')
      .click();

    cy.get('[data-cy="cy-ggisReference-question-title"]').contains(
      'Enter your GGIS Scheme Reference Number'
    );
    cy.get('[data-cy="cy-ggisReference-text-input"]')
      .should('have.value', '1234567890')
      .clear();

    // Validation checks
    // VC: Too many characters
    cy.get('[data-cy="cy-ggisReference-text-input"]').type(
      EXCESSIVE_CHARACTER_STRING
    );
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('contain', '/scheme/edit/ggis-reference');

    // Check error banner
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_ggisReference"]')
      .contains('GGIS Reference should not be greater than 255 characters')
      .click();
    cy.focused().should('have.attr', 'name', 'ggisReference');

    cy.get(
      '[data-cy="cy-ggisReference-input-validation-error-details"]'
    ).contains('GGIS Reference should not be greater than 255 characters');
    run_accessibility();

    // VC: No input
    cy.get('[data-cy="cy-ggisReference-text-input"]').clear();
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('contain', '/scheme/edit/ggis-reference');

    // Check error banner
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_ggisReference"]')
      .contains('Enter your GGIS Scheme Reference Number')
      .click();
    cy.focused().should('have.attr', 'name', 'ggisReference');

    cy.get(
      '[data-cy="cy-ggisReference-input-validation-error-details"]'
    ).contains('Enter your GGIS Scheme Reference Number');

    cy.get('[data-cy="cy-ggisReference-text-input"]').type('9876543210');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'QA Test Scheme'
    );
    cy.get(
      '[data-cy="cy_summaryListValue_GGIS Scheme Reference Number"]'
    ).contains('9876543210');
  });
  it('should allow email to be edited', () => {
    // Editing the email
    cy.get('[data-cy="cy_Change the support email address"]').click();
    cy.get('[data-cy="cy-contactEmail-question-title"]').contains(
      'Enter the email address you want to use for support'
    );
    cy.get('input').eq(0).should('have.value', 'dummy@test.com').clear();

    // VC: No input
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.get('[data-cy="cy_summaryListValue_Support email address"]').should(
      'have.text',
      '–'
    );

    // VC: No valid email
    cy.get('[data-cy="cy_Change the support email address"]').click();
    cy.get('input').eq(0).type('dummyinvalidemail');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    // Check Error banners
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_contactEmail"]')
      .contains(
        'Enter an email address in the correct format, like name@example.com'
      )
      .click();
    cy.focused().should('have.attr', 'name', 'contactEmail');

    cy.get(
      '[data-cy="cy-contactEmail-input-validation-error-details"]'
    ).contains(
      'Enter an email address in the correct format, like name@example.com'
    );

    // VC: access of 255 characters
    cy.get('input').eq(0).type(EXCESSIVE_CHARACTER_EMAIL);
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('contain', '/scheme/edit/email');

    // Check Error banners

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_contactEmail"]')
      .contains(
        'Enter an email address in the correct format, like name@example.com'
      )
      .click();
    cy.focused().should('have.attr', 'name', 'contactEmail');
    run_accessibility();

    cy.get(
      '[data-cy="cy-contactEmail-input-validation-error-details"]'
    ).contains(
      'Enter an email address in the correct format, like name@example.com'
    );

    cy.get('input').eq(0).clear().type('dummytestcomplete@test.com');
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.get('[data-cy="cy_summaryListValue_Support email address"]').contains(
      'dummytestcomplete@test.com'
    );
  });
});
