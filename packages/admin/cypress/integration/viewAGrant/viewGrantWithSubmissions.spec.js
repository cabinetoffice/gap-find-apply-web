import run_accessibility from '../../utils/run_accessibility';
describe('View a grant scheme with submission', () => {
  before(() => {
    cy.session('View a grant scheme with submission', () => {
      cy.visit('/');
    });
  });

  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-cy="cy_SchemeListButton"]').click();
    cy.url().should('include', '/scheme-list');
    cy.get(
      '[data-cy="cy_linkToScheme_Woodland Partnership (Forestry England)"]'
    )
      .should('exist')
      .click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'Woodland Partnership (Forestry England)'
    );
    run_accessibility();
  });

  it('should allow admins to click on "View submitted applications" button when there is a submission', () => {
    //This to be changed to the application name once the bug has been fixed
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'Woodland Partnership (Forestry England)'
    );
    run_accessibility();

    cy.get(
      '[data-cy="cy_Scheme-details-page-button-View submitted application"]'
    )
      .contains('View submitted applications')
      .should('not.have.attr', 'disabled');

    cy.get('[data-cy="cy_Scheme-details-page-h2-View submitted applciations"]')
      .contains('View submitted applications')
      .should('have.prop', 'tagName', 'H2');

    cy.get('[data-cy="cy_Scheme-details-page-Submission-count-text"]').contains(
      'To see who has applied for your grant, you need to view and download your submitted applications.'
    );

    cy.get(
      '[data-cy="cy_Scheme-details-page-button-View submitted application"]'
    ).should('have.attr', 'href');

    //View submitted applications table
    cy.get('[data-cy="cy_tableColumnName_Application state"]')
      .contains('Application state')
      .should('have.attr', 'class')
      .and('contain', 'govuk-table__header');

    cy.get('[data-cy="cy_tableColumnName_No of applications"]')
      .contains('No of applications')
      .should('have.attr', 'class')
      .and('contain', 'govuk-table__header');

    cy.get('[data-cy="cy_table_row-for-Application state-row-0-cell-0"]')
      .contains('In progress')
      .should('have.attr', 'class')
      .and('contain', 'govuk-table__header');

    cy.get(
      '[data-cy="cy_table_row-for-No of applications-row-0-cell-1"]'
    ).contains('0');

    cy.get('[data-cy="cy_table_row-for-Application state-row-1-cell-0"]')
      .contains('Submitted')
      .should('have.attr', 'class')
      .and('contain', 'govuk-table__header');

    cy.get(
      '[data-cy="cy_table_row-for-No of applications-row-1-cell-1"]'
    ).contains('1');
    //clicking into view submitted applciations button
    cy.get(
      '[data-cy="cy_Scheme-details-page-button-View submitted application"]'
    ).click();

    //in Download-submissions page

    cy.url().should('include', 'download-submissions');
    cy.get('h1').first().contains('View your applications');
    cy.get('[data-cy="cy_Download-submissions-page-text-1"]').contains(
      'To see who has applied for your grant, you need to view and download your submitted applications.'
    );
    cy.get('[data-cy="cy_Download-submissions-page-text-2"]').contains(
      'Get started by requesting a list of applications.'
    );

    cy.get('[data-cy="cy-button-Download submitted applications"]').contains(
      'Download submitted applications'
    );
  });
  it('should allow grant to be viewed and "Download requried checks" buttons enabled', () => {
    //required checks section
    cy.get('[data-cy="cy_Scheme-details-page-h2-Required checks"]')
      .contains('Required checks')
      .should('have.prop', 'tagName', 'H2');

    cy.get(
      '[data-cy="cy_Scheme-details-page-Required-checks-text-1"]'
    ).contains(
      "Download the information from the 'Required checks' section of the application form only."
    );

    cy.get(
      '[data-cy="cy_Scheme-details-page-Required-checks-text-2"]'
    ).contains(
      'You can use this information to carry out due-diligence checks. You can use the Cabinet Office service Spotlight for these checks.'
    );

    cy.get('[data-cy="cy_Scheme-details-page-button-Download required checks"]')
      .contains('Download required checks')
      .should('not.have.attr', 'disabled');

    cy.get('[data-cy="cy_Scheme-details-page-button-Download required checks"]')
      .should('have.attr', 'class')
      .and('include', 'govuk-button--secondary');
  });
});
