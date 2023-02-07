import run_accessibility from '../../utils/accessibility';
import checkErrorBanner from '../../utils/checkErrorBanner';
import getLoginCookie from '../../utils/getLoginCookie';

describe('Register to apply for a grant', () => {
  beforeEach(() => {
    getLoginCookie();
    cy.visit('/');
  });
  it('should land on apply for a grant page', () => {
    run_accessibility();

    cy.get('[data-cy="cy-apply-header"]').should(
      'have.text',
      'Apply for a grant'
    );
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
      'Find a grant'
    );
    cy.get('[data-cy="cy-find-a-grant-description"]').should(
      'have.text',
      'Before you can apply, you will need to find a grant that you want to apply for.'
    );
    cy.get('[data-cy="cy-find-a-grant-link"]').should('exist').click();

    cy.url().should('eq', 'https://www.find-government-grants.service.gov.uk/');
  });

  it('should land on registration page', () => {
    cy.get('[data-cy="cy-apply-register-button"]').click();

    run_accessibility();

    cy.url().should('include', 'register');

    cy.get('[data-cy="cy-registration-header"]').should(
      'have.text',
      'Sign in or create an account to apply'
    );
    cy.get('[data-cy="cy-sign-in-link"]').should('exist');
    cy.get('[data-cy="cy-registration-subheader"]').should(
      'have.text',
      'Create an account'
    );
    cy.get('[data-cy="cy-registration-description"]').should(
      'have.text',
      'Enter your details below to create an account and apply for a grant.'
    );
    cy.get('[data-cy="cy-firstName-question-title"]').should(
      'have.text',
      'First name'
    );
    cy.get('[data-cy="cy-lastName-question-title"]').should(
      'have.text',
      'Last name'
    );
    cy.get('[data-cy="cy-email-question-title"]').should(
      'have.text',
      'Enter your email address'
    );
    cy.get('[data-cy="cy-email-question-hint"]').should(
      'have.text',
      'You will use this email address every time you sign in.'
    );
    cy.get('[data-cy="cy-emailConfirmed-question-title"]').should(
      'have.text',
      'Confirm your email address'
    );
    cy.get('[data-cy="cy-telephone-question-title"]').should(
      'have.text',
      'UK telephone number (mobile)'
    );
    cy.get('[data-cy="cy-telephone-question-hint"]').should(
      'have.text',
      'You must enter a UK mobile telephone number to continue.We will send a verification code to this number every time you sign in.'
    );
    cy.get('[data-cy="cy-checkbox-label-agreed"]').should(
      'have.text',
      'I have read and agree to the Privacy policy'
    );
    cy.get('[data-cy="cy-sign-in-link"]').click();

    cy.url().should(
      'eq',
      'https://auth-testing.cabinetoffice.gov.uk/v2/find-grants/login'
    );
    cy.visit('/register');
  });

  it('should only be able to register by completing all mandatory fields', () => {
    cy.visit('/register');

    // Checks empty inputs
    cy.get('[data-cy="cy-firstName-text-input"]').should('have.value', '');
    cy.get('[data-cy="cy-lastName-text-input"]').should('have.value', '');
    cy.get('[data-cy="cy-email-text-input"]').should('have.value', '');
    cy.get('[data-cy="cy-emailConfirmed-text-input"]').should('have.value', '');
    cy.get('[data-cy="cy-telephone-text-input"]').should('have.value', '');
    cy.get('[data-cy="cy-checkbox-value-agreed"]').should('not.be.checked');

    cy.wait(200);
    cy.get('[data-cy="cy-firstName-text-input"]').type('First name');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner('lastName', 'Enter a last name', true);
    checkErrorBanner('email', 'Enter an email address', true);
    checkErrorBanner('emailConfirmed', 'Enter an email address', true);
    checkErrorBanner(
      'telephone',
      'Enter a UK telephone number, like 07123456789',
      true
    );
    checkErrorBanner(
      'privacyPolicy',
      'You must confirm that you have read and agreed to the privacy policy',
      true
    );

    cy.get('[data-cy="cy-firstName-text-input"]').clear();
    cy.get('[data-cy="cy-lastName-text-input"]').type('Last name');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner('firstName', 'Enter a first name', true);

    cy.get('[data-cy="cy-lastName-text-input"]').clear();

    //Checks invalid inputs
    cy.visit('/register');

    cy.wait(200);
    cy.get('[data-cy="cy-firstName-text-input"]').type('??????');
    cy.get('[data-cy="cy-lastName-text-input"]').type('??????');
    cy.get('[data-cy="cy-email-text-input"]').type('invalid@email');
    cy.get('[data-cy="cy-emailConfirmed-text-input"]').type(
      'email@does-not-match'
    );
    cy.get('[data-cy="cy-telephone-text-input"]').type('123456789');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner('firstName', 'First name must contain only letters', true);
    checkErrorBanner('lastName', 'Last name must contain only letters', true);
    checkErrorBanner('email', 'Email addresses must match', true);
    checkErrorBanner('emailConfirmed', 'Email addresses must match', true);
    checkErrorBanner(
      'telephone',
      'Enter a UK telephone number, like 07123456789',
      true
    );

    // Should submit correctly

    cy.get('[data-cy="cy-firstName-text-input"]').clear().type('Test');
    cy.get('[data-cy="cy-lastName-text-input"]').clear().type('Tester');
    cy.get('[data-cy="cy-email-text-input"]')
      .clear()
      .type('cytestdata@testing.com');
    cy.get('[data-cy="cy-emailConfirmed-text-input"]')
      .clear()
      .type('cytestdata@testing.com');
    cy.get('[data-cy="cy-telephone-text-input"]').clear().type('07123456789');
    cy.get('[data-cy="cy-checkbox-value-agreed"]').click();
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.get('[data-cy="cy-registration-complete-header"]').should(
      'contain',
      'Registration complete'
    );

    cy.get('[data-cy="cy-your-applications-link"]')
      .should('have.attr', 'href')
      .and('include', 'grants');
    cy.get('[data-cy="cy-sign-in-link"]').click();
    cy.url().should(
      'eq',
      'https://auth-testing.cabinetoffice.gov.uk/v2/find-grants/login'
    );
  });
});
