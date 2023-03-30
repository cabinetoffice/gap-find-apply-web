import run_accessibility from '../../utils/accessibility';
import getLoginCookie from '../../utils/getLoginCookie';

describe('Register to apply for a grant', () => {
  beforeEach(() => {
    getLoginCookie();
    cy.visit('/');
  });
  it('should land on apply for a grant page', () => {
    run_accessibility();

    cy.get('[data-cy="cy-apply-header"]').should('have.text', 'Find a Grant');
    cy.get('[data-cy="cy-apply-description"]').should(
      'have.text',
      'Use this service to apply for a government grant.'
    );
    cy.get('[data-cy="cy-apply-hint-text"]').should(
      'have.text',
      'During your application you will be asked questions that help funding organisations make a decision about who to award funding to.'
    );
    cy.get('[data-cy="cy-apply-register-button"]').should('exist');
    cy.get('[data-cy="cy-apply-existing-account-link"]').should('exist');

    cy.get('[data-cy="cy-find-a-grant-header"]').should(
      'have.text',
      'Browse grants'
    );
    cy.get('[data-cy="cy-find-a-grant-description"]').should(
      'have.text',
      'Before you can apply, you will need to find a grant that you want to apply for.'
    );
    cy.get('[data-cy="cy-find-a-grant-link"]').should('exist').click();

    cy.url().should('eq', 'https://www.find-government-grants.service.gov.uk/');
  });
});
