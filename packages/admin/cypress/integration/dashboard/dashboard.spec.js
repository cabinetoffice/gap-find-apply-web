import run_accessibility from '../../utils/run_accessibility';

describe('dashboard', () => {
  beforeEach(() => {
    cy.session('dashboard', () => {
      cy.visit('/');
    });
    cy.visit('/');
  });

  it('Should have no accessibility violations on admin dashboard', () => {
    cy.visit('/dashboard');

    cy.get('[data-cy="cy_dashboardPageTitle"]')
      .should('be.visible')
      .contains('Manage a grant');
    run_accessibility();
  });

  it('Should render a table containing the list of scheme names and descriptions', () => {
    cy.visit('/dashboard');

    cy.get('[data-cy="cy_tableColumnName_Name"]')
      .should('be.visible')
      .contains('Name');

    cy.get('[data-cy="cy_tableColumnName_Date created"]')
      .should('be.visible')
      .contains('Date created');

    cy.get('[data-cy="cy_addAGrantButton"')
      .should('be.visible')
      .contains('Add a grant');

    cy.get('[data-cy=cy_TableBody]').should('be.visible');

    cy.get('[data-cy="cy_table_row"]').should('have.length', 2);
  });
});
