import run_accessibility from './accessibility';

export default function checkErrorBanner(fieldName, errorMessage, canFocus) {
  cy.get('[data-cy="cyErrorBanner"]').should('exist');
  cy.get('[data-cy="cyErrorBannerHeading"]').should(
    'have.text',
    'There is a problem'
  );
  cy.get(`[data-cy=cyError_${fieldName}]`).should('have.text', errorMessage);
  cy.get(`[data-cy="cy-${fieldName}-input-validation-error-details"]`).should(
    'have.text',
    `Error: ${errorMessage}`
  );
  run_accessibility();
  if (canFocus) {
    cy.get(`[data-cy=cyError_${fieldName}]`).click();
    cy.focused().should('have.attr', 'name', fieldName);
  }
}
