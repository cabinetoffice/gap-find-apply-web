export default function createTestApplication(schemeName) {
  cy.visit('/scheme-list');
  cy.get(
    '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"'
  ).click();

  cy.get('[data-cy="cyBuildApplicationForm"]').click();

  cy.get('input').eq(0).type(schemeName);
  cy.get('[data-cy="cy-button-Continue"]').click();

  cy.get('[data-cy="cyApplicationTitle"]').contains(schemeName);
}
