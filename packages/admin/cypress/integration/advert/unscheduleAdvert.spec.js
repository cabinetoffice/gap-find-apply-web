import run_accessibility from '../../utils/run_accessibility';
import { unscheduleExistingAdvert } from '../../utils/grantAdvertUtils/unscheduleTestAdvert';
import checkErrorBanner from '../../utils/checkErrorBanner';

let summaryPageURL;
const loginAndVisitAdvertSummary = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        cy.visit('/');
        cy.visit(
          '/scheme/6/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87e/summary'
        );
        cy.url()
          .should('include', '/summary')
          .then((url) => {
            summaryPageURL = url;
          });
      },
    }
  );
};

describe('Unschedule grant advert', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndVisitAdvertSummary('unadvert-summary');
  });
  beforeEach(() => {
    cy.visit(summaryPageURL);
    unscheduleExistingAdvert();
    cy.get('[data-cy="cy-publish-advert-button"]').click();
    cy.url().should('include', 'summary');
  });
  after(() => {
    cy.visit(summaryPageURL);
    unscheduleExistingAdvert();
  });

  it('should unschedule the advert', () => {
    cy.get('[data-cy="cy-button-Schedule my advert"]').click();
    cy.get('[data-cy="cy-advert-scheduled"]').should(
      'have.text',
      'Grant advert successfully scheduled'
    );
    //   Back to scheme
    cy.get('[data-cy="back-to-my-account-button"]').click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');

    // check status
    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]').should('exist').click();
    cy.get('[data-cy="cy-status-tag-SCHEDULED"]').should(
      'have.text',
      'Advert status: SCHEDULED'
    );

    // Check unschedule button text
    cy.get('[data-cy="cy-unschedule-advert-button"]')
      .should('have.text', 'Make changes to my advert')
      .click();

    cy.url().should('include', '/unschedule-confirmation');
    run_accessibility();

    // Navigate to unschedule confirmation page
    cy.get('[data-cy="cy-confirmation-question-title"]')
      .contains('Are you sure you want to change your advert?')
      .and('have.prop', 'tagName', 'H1');

    cy.get('[data-cy="cy-unschedule-confirmation-hint-text"]').contains(
      'Your advert will be unscheduled. To schedule your advert, you will need to review and publish it again.'
    );

    cy.get('[data-cy="cy-radioInput-option-YesUnscheduleMyAdvert"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-radioInput-label-YesUnscheduleMyAdvert"]').contains(
      'Yes, unschedule my advert'
    );

    cy.get('[data-cy="cy-radioInput-option-NoKeepMyAdvertScheduled"]').should(
      'not.be.checked'
    );

    cy.get('[data-cy="cy-radioInput-label-NoKeepMyAdvertScheduled"]').contains(
      'No, keep my advert scheduled'
    );

    cy.get('[data-cy="cy_unscheduleConfirmation-ConfirmButton"]')
      .contains('Confirm')
      .click();

    checkErrorBanner(
      'confirmation',
      'You must select either "Yes, unschedule my advert" or "No, keep my advert scheduled"'
    );

    // Should return to "Summary" page when "'No, keep my advert scheduled" is selected in unschedule confirmation page
    cy.get('[data-cy="cy-radioInput-option-NoKeepMyAdvertScheduled"]').check();
    cy.get('[data-cy="cy_unscheduleConfirmation-ConfirmButton"]').click();

    cy.url().should('include', '/summary');

    // Should return to "Summary" page when the back button is clicked in unschedule confirmation page
    cy.get('[data-cy="cy-unschedule-advert-button"]').click();
    cy.url().should('include', '/unschedule-confirmation');
    cy.get('[data-cy="cy-unschedule-confirmation-page-back-button"]')
      .contains('Back')
      .click();
    cy.url().should('include', '/summary');

    // Should return to "Section overview" page when "'Yes, unschedule my advert'" is selected in unschedule confirmation page
    cy.get('[data-cy="cy-unschedule-advert-button"]').click();
    cy.url().should('include', '/unschedule-confirmation');

    cy.get('[data-cy="cy-radioInput-option-YesUnscheduleMyAdvert"]').check();
    cy.get('[data-cy="cy_unscheduleConfirmation-ConfirmButton"]').click();

    cy.url().should('include', '/section-overview');

    // Should render an important banner
    cy.get('[data-cy="cyImportantBannerTitle"]')
      .should('have.prop', 'tagName', 'H2')
      .and('contain', 'Important');
    run_accessibility();

    cy.get('[data-cy="cy-review-and-publish-advert-header"]')
      .should('have.prop', 'tagName', 'H2')
      .and('contain', 'Review and publish your advert');

    cy.get('[data-cy="cy-review-and-publish-advert-body-1"]').contains(
      'You need to review and publish your advert, even if you have not made any changes.'
    );
    cy.get('[data-cy="cy-review-and-publish-advert-body-2"]').contains(
      'If you do not it will not be added to Find a grant, or scheduled to be added on the opening date.'
    );

    // Scheudled status should no longer be there
    cy.get('[data-cy="cy-status-tag-SCHEDULED"]').should('not.exist');

    cy.get('[data-cy="cy-publish-advert-button"]')
      .contains('Review and publish')
      .and('have.prop', 'href')
      .and('includes', '/summary');

    // Check persistent important banner component
    cy.get('[data-cy="cy-exit"]').contains('Exit').click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');

    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]').click();
    cy.url().should('includes', '/section-overview');

    cy.get('[data-cy="cyImportantBannerTitle"]').should('exist');
  });
});
