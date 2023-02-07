import run_accessibility from './run_accessibility';

export default function checkErrorBanner(fieldName, errorMessage) {
  cy.get('[data-cy="cyErrorBanner"]').should('exist');
  cy.get('[data-cy="cyErrorBannerHeading"]').should(
    'have.text',
    'There is a problem'
  );
  cy.get(`[data-cy="cyError_${fieldName}"]`).should('have.text', errorMessage);
  cy.get(`[data-cy="cy-${fieldName}-input-validation-error-details"]`).should(
    'have.text',
    `Error: ${errorMessage}`
  );

  // Will check focus for input fields and for radios/checkboxes - the first option (as per GDS)
  cy.get(`[data-cy="cyError_${fieldName}"]`).click();
  cy.focused().should('have.attr', 'id', fieldName);

  run_accessibility();
}
