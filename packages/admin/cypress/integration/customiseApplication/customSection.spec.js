import run_accessibility from '../../utils/run_accessibility';
import { deleteExistingTestApplication } from '../../utils/deleteApplications';
import createTestApplication from '../../utils/createTestApplication';
describe('Customise Section', () => {
  const applicationName = 'A testing application';
  let customSectionCounter = 3;
  before(() => {
    cy.session('Custom section', () => {
      cy.visit('/');
    });
    cy.visit('/');

    deleteExistingTestApplication();
    createTestApplication(applicationName);
  });

  after(() => {
    deleteExistingTestApplication();
  });

  beforeEach(() => {
    cy.visit('/scheme-list');
    cy.get(
      '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"'
    ).click();

    cy.get('[data-cy="cy_view-application-link"]').click();
  });

  it('Should allow admins to add new custom section', () => {
    //create a section
    cy.get('[data-cy="cy-button-addNewSection"]')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', 'section-name');
    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('input').eq(0).should('have.value', '');

    // cy.get('input').type('Custom section');
    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //not blank validation

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    run_accessibility();

    cy.get('[data-cy="cyError_sectionTitle"]')
      .contains('Enter a section name')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'sectionTitle');

    //only text validation

    cy.get('input').eq(0).type('Custom section123!');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    cy.get('[data-cy="cyError_sectionTitle"]')
      .contains(
        'Section name must only use letters a to z, and special characters such as hyphens, spaces and apostrophes'
      )
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'sectionTitle');

    //max length validation

    cy.get('input').eq(0).type('a'.repeat(256), { delay: 0 });
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    cy.get('[data-cy="cyError_sectionTitle"]')
      .contains('Your Section name must be 250 characters or less.')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'sectionTitle');

    //unique validation
    cy.get('input').eq(0).type('Eligibility');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    cy.get('[data-cy="cyError_sectionTitle"]')
      .contains('Section name has to be unique')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'sectionTitle');

    //valid custom title
    cy.get('input').eq(0).type('Custom section');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);

    //add a check if custom section has been added
    cy.get(
      `[data-cy="cy-table-caption-${customSectionCounter}. Custom section"]`
    )
      .should('exist')
      .and('have.text', `${customSectionCounter}. Custom section`);
    run_accessibility();
    customSectionCounter++;
  });

  it('Should allow admins to delete a section', () => {
    //create a section
    cy.get('[data-cy="cy-button-addNewSection"]')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', 'section-name');
    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('input').eq(0).should('have.value', '').type('Custom section two');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);

    //add a check if custom sextion has been added
    cy.get(
      `[data-cy="cy-table-caption-${customSectionCounter}. Custom section two"]`
    )
      .should('exist')
      .and('have.text', `${customSectionCounter}. Custom section two`);

    //check that delete section is rendered
    cy.get('[data-cy="cy_sections_deleteSectionBtn-Custom section two"]')
      .contains('Delete this section')
      .click();

    //run accessiblity on delete confirmation page
    cy.url().should('include', 'delete-confirmation');
    run_accessibility();
    cy.get('h1').should('have.text', 'Do you want to delete this section?');

    //make sure no is checked and yes isn't
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    //check cancel button exists and it should take you to dashboard
    cy.get('[data-cy="cy_deleteSection-cancelLink"]')
      .contains('Cancel')
      .click();
    //back to dashboard

    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);
    cy.url().should('include', 'dashboard');
    cy.get(
      `[data-cy="cy-table-caption-${customSectionCounter}. Custom section two"]`
    )
      .should('exist')
      .and('have.text', `${customSectionCounter}. Custom section two`);

    //click confirm when no is selected
    cy.get(
      '[data-cy="cy_sections_deleteSectionBtn-Custom section two"]'
    ).click();

    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    cy.get('[data-cy="cy-radioInput-option-No"]').click();

    cy.get('[data-cy="cy-button-Confirm"]').contains('Confirm').click();

    //back to dashboard

    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);
    cy.url().should('include', 'dashboard');
    cy.get(
      `[data-cy="cy-table-caption-${customSectionCounter}. Custom section two"]`
    )
      .should('exist')
      .and('have.text', `${customSectionCounter}. Custom section two`);

    //click yes on delete and confirm
    cy.get(
      '[data-cy="cy_sections_deleteSectionBtn-Custom section two"]'
    ).click();

    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    //click delete button
    cy.get('[data-cy="cy-button-Confirm"]').contains('Confirm').click();

    //check if deleted

    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);
    cy.url().should('include', 'dashboard');

    cy.get(
      `[data-cy="cy-table-caption-${customSectionCounter}. Custom section two"]`
    ).should('not.exist');
    customSectionCounter++;
  });
});
