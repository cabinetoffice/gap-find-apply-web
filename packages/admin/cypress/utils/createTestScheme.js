export default function createTestScheme(schemeName) {
  cy.visit('/');
  cy.get('[data-cy="cy_addAGrantButton"').click();

  cy.get('input').eq(0).type(schemeName);

  cy.get('[data-cy="cy-button-Save and continue"]').click();

  cy.get('input').eq(0).type('1234567890');
  cy.get('[data-cy="cy-button-Save and continue"]').click();

  cy.get('input').eq(0).type('dummy@test.com');
  cy.get('[data-cy="cy-button-Save and continue"]').click();

  cy.get('[data-cy="cy_addAGrantConfirmationPageButton"')
    .contains('Confirm')
    .click();
}
