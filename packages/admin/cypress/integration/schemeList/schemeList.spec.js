import run_accessibility from '../../utils/run_accessibility';

describe('schemeList page', () => {
  beforeEach(() => {
    cy.session('Scheme list page', () => {
      cy.visit('/');
    });

    cy.visit('/dashboard');
    cy.get('[data-cy="cy_SchemeListButton"]').click();
  });

  it('Should have no accessibility violations on scheme list page', () => {
    cy.get('[data-cy="cy_schemeListingPageTitle"]')
      .should('be.visible')
      .contains('All grants');
    run_accessibility();
  });

  it('Should render a table containing the list of scheme names and descriptions', () => {
    cy.get('[data-cy="cy_dashboardTableHeader_Scheme name"]').should(
      'not.exist'
    );
    cy.get('[data-cy="cy_dashboardTableHeader_Scheme description"]').should(
      'not.exist'
    );
    cy.get('[data-cy="cy_addAGrantButton"')
      .should('be.visible')
      .contains('Add a grant');

    cy.get('[data-cy="cy_schemeListingPageDescription"')
      .should('be.visible')
      .contains('The list below shows all of the grants for your account.');

    cy.get('[data-cy=cy_TableBody]').should('be.visible');

    cy.get('[data-cy=cy_TableBody]').should('be.visible');
  });
});
