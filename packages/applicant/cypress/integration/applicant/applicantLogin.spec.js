import run_accessibility from '../../utils/accessibility';
import getLoginCookie from '../../utils/getLoginCookie';

describe('Login to the applicant dashboard', () => {
  it('should redirect a user if they are not logged in', () => {
    cy.visit('/dashboard');
    cy.url().should(
      'eq',
      'https://sandbox-gap.service.cabinetoffice.gov.uk/apply/applicant'
    );
  });
});

describe('Login to the applicant dashboard', () => {
  before(() => {
    cy.visit('/');
    getLoginCookie();
  });
  it('should load the dashboard page if the user is logged in', () => {
    cy.visit('/dashboard');
    run_accessibility();
    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cy-applicant-dashboard-header"]').should(
      'have.text',
      'Your account'
    );
  });
});
