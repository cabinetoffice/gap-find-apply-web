const summaryPageNavigationChecks = (url) => {
  //visiting section-overivew redirects to summary page
  cy.visit(url);
  cy.url().should('include', '/summary');

  // Checking for navigation buttons
  cy.get('[data-cy="cy-advert-summary-page-back-button"]')
    .contains('Back')
    .click();

  cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');

  cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]')
    .contains('View or change your advert')
    .click();

  cy.url().should('include', '/summary');

  cy.get('[data-cy="cy-back-to-scheme-link"]').contains('Back').click();

  cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');
};

export { summaryPageNavigationChecks };
