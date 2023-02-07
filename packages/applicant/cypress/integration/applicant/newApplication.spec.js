import run_accessibility from '../../utils/accessibility';
import getLoginCookie from '../../utils/getLoginCookie';
import deleteSubmission from '../../utils/deleteSubmission';

describe('Manage a new application', () => {
  it('should only land on the section statuses page for a new application the first time the link is visited', () => {
    getLoginCookie();
    deleteSubmission(3);

    cy.visit('/applications');

    cy.get(
      '[data-cy="cy-application-link-Woodland Partnership Application"]'
    ).should('not.exist');

    cy.visit('/applications/3');
    run_accessibility();

    cy.url().should('include', 'sections');
    cy.get(
      '[data-cy="cy-application-name-Woodland Partnership Application"]'
    ).should('have.text', 'Woodland Partnership Application');

    cy.visit('/applications/3');

    cy.url().should('not.include', 'sections');

    cy.get('[data-cy="cy-your-applications-header"]').should(
      'have.text',
      'Your applications'
    );
    cy.get(
      '[data-cy="cy-application-link-Woodland Partnership Application"]'
    ).should('have.text', 'Woodland Partnership Application');

    deleteSubmission(3);
  });
});
