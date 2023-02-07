import run_accessibility from '../../utils/run_accessibility';

describe('Admin login', () => {
  it('Should redirect the admin to cola when attempting to login', () => {
    cy.visit('/login');
    run_accessibility();
    cy.get('[  data-cy="cy-sign-in-admin-button"]').click();
    cy.url().should(
      'include',
      'https://auth-testing.cabinetoffice.gov.uk/v2/gap/login'
    );
  });

  it('Should redirect admins to COLA auth page when not authenticated', () => {
    cy.origin('https://cabinetoffice.gov.uk', () => {
      cy.visit(`${Cypress.config().baseUrl}/dashboard`);
      cy.url().should(
        'eq',
        'https://auth-testing.cabinetoffice.gov.uk/v2/find-grants/login'
      );
    });
  });

  it('Should allow admins to logout and should clear session_id cookie', () => {
    cy.visit('/');
    cy.url().should('include', '/dashboard');
    //checks if session_id cookie exists
    cy.getCookie('session_id').should('exist');
    cy.get('[data-cy="cy_dashboardPageTitle"]')
      .contains('Manage a grant')
      .and('have.prop', 'tagName', 'H1');
    cy.get('[data-cy="cy_SignOutLink"]').contains('Sign out').click();
    cy.url().should(
      'eq',
      'https://auth-testing.cabinetoffice.gov.uk/v2/find-grants/login'
    );
    //checks if session_id cookie is removed
    cy.getCookie('session_id').should('not.exist');
    cy.visit('/login');
    cy.getCookie('session_id').should('not.exist');

    //if visiting dashboard without authenticating, should redirect to login page
    cy.origin('https://cabinetoffice.gov.uk', () => {
      cy.visit(`${Cypress.config().baseUrl}/dashboard`);
      cy.url().should(
        'eq',
        'https://auth-testing.cabinetoffice.gov.uk/v2/find-grants/login'
      );
    });
  });
});
