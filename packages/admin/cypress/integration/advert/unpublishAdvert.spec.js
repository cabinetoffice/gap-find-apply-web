import checkErrorBanner from '../../utils/checkErrorBanner';
import run_accessibility from '../../utils/run_accessibility';
import { unpublishExistingAdvert } from '../../utils/grantAdvertUtils/unpublishTestAdvert';

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
          '/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/summary'
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

const publishAndNavigateToUnpublishConfirmation = () => {
  cy.get('[data-cy="cy-button-Confirm and publish"]').click();
  cy.get('[data-cy="back-to-my-account-button"]').click();
  cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]').click();
  cy.get('[data-cy="cy-unpublish-advert-button"]').click();
};

describe('Grant advert summary page', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndVisitAdvertSummary('advert-summary');
  });
  beforeEach(() => {
    cy.visit(summaryPageURL);
    unpublishExistingAdvert();
    cy.visit(summaryPageURL);
  });
  after(() => {
    cy.visit(summaryPageURL);
    unpublishExistingAdvert();
  });

  it('Should show a field error when trying to unpublish without selecting an option in comfirmation page', () => {
    publishAndNavigateToUnpublishConfirmation();

    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]').click();
    checkErrorBanner(
      'confirmation',
      "You must select either ‘Yes, unpublish my advert' or ‘No, keep my advert on Find a grant.'"
    );

    // Should return to "Section overview" page when "No, keep my advert on Find a grant" is selected in unpublish confirmation page
    cy.get(
      '[data-cy="cy-radioInput-option-NoKeepMyAdvertOnFindAGrant"]'
    ).click();
    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]').click();

    run_accessibility();
    cy.get('[data-cy="cy-confirm-unpublish-header"]').should(
      'have.text',
      'Unpublish your advert'
    );
    cy.get('[data-cy="cy-confirm-unpublish-help-text-1"]').should(
      'have.text',
      'To make changes to your advert you need to unpublish it first.'
    );

    cy.get('[data-cy="cy-confirm-unpublish-help-text-2"]').should(
      'have.text',
      'Once unpublished your advert will not appear on Find a grant.'
    );

    cy.get('[data-cy="cy-unpublish-advert-button"]').should('exist').click();

    // Should unpublish the advert
    run_accessibility();
    cy.get('[data-cy="cy-confirmation-question-title"]').should(
      'have.text',
      'Are you sure you want to unpublish this advert?'
    );
    cy.get('[data-cy="cy-confirmation-question-hint"]').should(
      'have.text',
      'Once unpublished, your advert will no longer appear on Find a grant.'
    );
    cy.get('[data-cy="cy-radioInput-option-YesUnpublishMyAdvert"]').should(
      'exist'
    );
    cy.get(
      '[data-cy="cy-radioInput-option-NoKeepMyAdvertOnFindAGrant"]'
    ).should('exist');
    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]').should(
      'exist'
    );

    // Unpublish the scheme
    cy.get('[data-cy="cy-radioInput-option-YesUnpublishMyAdvert"]').click();
    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]').click();

    // Confirm elements representative of unpublished state

    // Success banner
    cy.get('[data-cy="confirmation-message-banner"]').should('exist');
    cy.get('[data-cy="confirmation-message-title"]').should(
      'have.text',
      'Your advert has been unpublished'
    );
    cy.get('[data-cy="confirmation-message-text"]').should(
      'have.text',
      'Your advert does not appear on Find a grant.'
    );
    cy.get('[data-cy="cy-preview-advert-sidebar-title"]').should(
      'have.text',
      'Preview your advert'
    );
    cy.get('[data-cy="cy-preview-advert-sidebar-content"]').should(
      'have.text',
      'See how your advert will appear to applicants on Find a grant.'
    );
    cy.get('[data-cy="cy-preview-advert-sidebar-link"]').should('exist');

    cy.get('[data-cy="cy-status-tag-PUBLISHED"]').should('not.exist');

    // Publish action section
    cy.get('[data-cy="cy-confirm-publish-header"]').should(
      'have.text',
      'Publish your advert'
    );
    cy.get('[data-cy="cy-confirm-publish--help-text"]').should(
      'have.text',
      'If you have finished creating your advert, you can publish it on Find a grant.You will be able to check your advert again before it is published.'
    );
    cy.get('[data-cy="cy-publish-advert-button"]').should('exist');
    cy.get('[data-cy="cy-exit"]').should('exist');
  });
});
