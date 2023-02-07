import { deleteExistingTestApplication } from '../../utils/deleteApplications';
import run_accessibility from '../../utils/run_accessibility';
import { dueDiligenceCheckList } from '../../constants/constants';
describe('Build Application', () => {
  const applicationName = 'A testing application';

  before(() => {
    cy.session('Build application', () => {
      cy.visit('/');
    });
    deleteExistingTestApplication();

    cy.visit('/');
    cy.get('[data-cy="cy_SchemeListButton"]').click();

    cy.get(
      '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"]'
    ).click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"').contains(
      'EV Chargepoint Grant for flat owner-occupiers'
    );

    cy.get('[data-cy="cyBuildApplicationForm"]').click();
    cy.get('[data-cy="cy-applicationName-text-input"]')
      .click()
      .type(applicationName);

    cy.get('[data-cy="cy-button-Continue"]').click();
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="cy_SchemeListButton"]').click();

    cy.get(
      '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"]'
    ).click();
    cy.get('[data-cy="cy_view-application-link"]').click();
  });

  after(() => {
    deleteExistingTestApplication();
  });

  it('Should allow user to fill mandatory sections and appear as COMPLETE', () => {
    run_accessibility();

    // Dashboard page
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-1. Eligibility"]').should(
      'contain',
      '1. Eligibility'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-0"]').should(
      'contain',
      'Eligibility Statement'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-1"]').should(
      'have.text',
      'INCOMPLETE'
    );

    //Eligibility statement
    cy.get('[data-cy="cy_Section-Eligibility Statement"]').click();

    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('h1').contains('Eligibility statement');
    run_accessibility();

    cy.get('textarea').should('have.value', '');

    cy.get('textarea').clear();
    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    //empty input validation check
    cy.get('[data-cy="cyError_displayText"]')
      .contains('Text input can not be less than 2 characters')
      .click();
    run_accessibility();

    cy.focused().should('have.attr', 'name').and('eq', 'displayText');

    cy.get('textarea')
      .should('have.value', '')
      .click()
      .type('a'.repeat(6001), { delay: 0 });

    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();
    //6000 char validation

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_displayText"]')
      .contains('Text input can not be greater than 6000 characters')
      .click();
    run_accessibility();

    cy.focused().should('have.attr', 'name').and('eq', 'displayText');

    //minimum character validation
    cy.get('textarea').click().clear().type('1');
    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_displayText"]')
      .contains('Text input can not be less than 2 characters')
      .click();
    run_accessibility();
    cy.focused().should('have.attr', 'name').and('eq', 'displayText');

    cy.get('textarea').click().clear().type('dummy eligibility statement');
    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-1. Eligibility"]').should(
      'contain',
      '1. Eligibility'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-1"]').should(
      'have.text',
      'COMPLETE'
    );
    cy.get('[data-cy="cy_Section-Eligibility Statement"]').click();

    cy.get('textarea').contains('dummy eligibility statement');
    // cy.wait(1500);

    cy.get('[data-cy="cy_eligibilityPage_backbutton"]').click({ force: true });
    // Dashboard page
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-2. Required checks"]').should(
      'contain',
      '2. Required checks'
    );

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-0"]'
    ).should('contain', 'Due-diligence checks');

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-1"]'
    ).should('have.text', 'INCOMPLETE');

    //Due-diligence checks
    cy.get('[data-cy="cy_Section-due-diligence-checks"]').click();

    cy.url().should('include', 'due-diligence');

    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('h1').contains('Due-diligence checks');
    run_accessibility();

    cy.get('[data-cy="cy_adminSummaryList-items"]')
      .should('have.length', 7)
      .each((element, index) => {
        cy.get(element).contains(dueDiligenceCheckList[index]);
      });

    cy.get('[type="checkbox"]').should('not.be.checked');

    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    //validation error check when user does not check tickbox
    cy.get('[data-cy="cyError_confirmation"]')
      .contains(
        'You must confirm that you understand these due-diligence checks.'
      )
      .click();
    run_accessibility();

    cy.focused().should('have.attr', 'name').and('eq', 'confirmation');

    //submitting after ticking checkbox
    cy.get('[type="checkbox"]').should('not.be.checked');
    cy.get('[type="checkbox"]').check();
    cy.get('[type="checkbox"]').should('be.checked');

    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-2. Required checks"]').should(
      'contain',
      '2. Required checks'
    );

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-1"]'
    ).should('have.text', 'COMPLETE');
  });
});
