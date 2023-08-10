export const login = () => {
  cy.visit('/');
  cy.get('.govuk-button').click();
};
