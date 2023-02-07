import run_accessibility from '../../utils/accessibility';
import getLoginCookie from '../../utils/getLoginCookie';
import resetApplicantSubmissions from '../../utils/resetApplicantSubmissions';

describe('Manage your organisation details', () => {
  it('should land on Manage your organisation details page', () => {
    resetApplicantSubmissions(2);
    getLoginCookie();
    cy.visit('/dashboard');
    run_accessibility();
    cy.get('[data-cy="cy-applicant-dashboard-header"]').should(
      'have.text',
      'Your account'
    );

    cy.get('[data-cy="cy-your-applications-link"]').click();

    cy.url().should('include', 'applications');
    cy.get('[data-cy=cy-back-button]').click();

    cy.url().should('include', 'dashboard');

    cy.get('[data-cy="cy-applicant-dashboard-applications-subheader"]').should(
      'have.text',
      'View your applications'
    );
    cy.get('[data-cy="cy-your-applications-link"]').click();

    cy.url().should('include', '/applications');
    cy.get('[data-cy=cy-back-button]').click();

    cy.get('[data-cy="cy-link-card-Your organisation details"]').click();

    cy.url().should('include', 'organisation');

    resetApplicantSubmissions(1);

    cy.visit('/dashboard');

    cy.get('[data-cy="cy-no-existing-applications-paragraph-1"]').should(
      'have.text',
      'You have not started any applications.'
    );
    cy.get('[data-cy="cy-no-existing-applications-paragraph-2"]').should(
      'have.text',
      'To get started, you need to find a grant that you want to apply for.'
    );

    cy.get('[data-cy="cy-find-a-grant-link"]').click();

    cy.url().should('eq', 'https://www.find-government-grants.service.gov.uk/');
    resetApplicantSubmissions(2);
  });
});
