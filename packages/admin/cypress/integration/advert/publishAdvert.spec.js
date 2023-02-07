import run_accessibility from '../../utils/run_accessibility';
import { unpublishExistingAdvert } from '../../utils/grantAdvertUtils/unpublishTestAdvert';
import { summaryPageNavigationChecks } from '../../utils/grantAdvertUtils/summaryPageNavigationChecks';

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

describe('Grant advert summary page', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndVisitAdvertSummary('advert-summary');
  });
  beforeEach(() => {
    cy.visit(summaryPageURL);
    unpublishExistingAdvert();
    cy.get('[data-cy="cy-publish-advert-button"]').click();
    cy.url().should('include', 'summary');
    cy.get('[data-cy="cy-confirm-unpublish-header"]').should('not.exist');
  });
  after(() => {
    cy.visit(summaryPageURL);
    unpublishExistingAdvert();
  });

  it('should publish the advert', () => {
    const linkToAdvert =
      'https://d_gap.london.cloudapps.digital/grants/uk-tradeshow-programme-uktp-1';

    cy.get('[data-cy="cy-advert-summary-footer-text"]').should('exist');
    cy.get('[data-cy="cy-advert-summary-footer-text"]').should(
      'have.text',
      'Once published the advert will appear on Find a grant straight away.'
    );
    cy.get('[data-cy="cy-summary-1. Grant details-Short description-change"]')
      .should('exist')
      .and('have.text', 'Change');

    cy.get('[data-cy="cy-button-Confirm and publish"]').should('exist');
    cy.get('[data-cy="cy-button-Confirm and publish"]').click();
    cy.url({ timeout: 10000 }).should('includes', '/publish-success');
    cy.get('[data-cy="cy-advert-published"]').should(
      'have.text',
      'Grant advert published'
    );
    run_accessibility();
    cy.get('[data-cy="cy-link-to-advert"]').should('exist');
    cy.get('[data-cy="cy-link-to-advert"]')
      .should('have.text', linkToAdvert)
      .should('have.attr', 'href', linkToAdvert);

    //   Back to scheme
    cy.get('[data-cy="back-to-my-account-button"]').click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');
    cy.get('[data-cy="cy-link-to-advert-on-find"]').should('exist');
    cy.get('[data-cy="cy-link-to-advert-on-find"]')
      .should('have.text', linkToAdvert)
      .should('have.attr', 'href', linkToAdvert);

    // check status
    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]').should('exist').click();
    cy.url().should('include', 'summary');
    cy.get('[data-cy="cy-status-tag-PUBLISHED"]').should(
      'have.text',
      'Advert status: PUBLISHED'
    );

    cy.get('[data-cy="cy-summary-heading"]').should(
      'have.text',
      'Your grant advert'
    );
    // Check if Change links and publish content has been removed
    cy.get('[data-cy="cy-advert-summary-footer-text"]').should('not.exist');

    cy.get(
      '[data-cy="cy-summary-1. Grant details-Short description-change"]'
    ).should('not.exist');

    cy.get('[data-cy="cy-confirm-unpublish-header"]').should('exist');
    cy.get('[data-cy="cy-unpublish-advert-button"]').should('exist');
    cy.get('[data-cy="cy-back-to-scheme-link"]').should('exist').click();
    cy.url().should('eq', 'http://localhost:3000/apply/admin/scheme/5');

    summaryPageNavigationChecks(
      '/scheme/5/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview'
    );
  });
  /*
  todo: add a test data to publish with the same grant name
  */
  it.skip('should publish the same advert with a different slug', () => {
    const linkToAdvertDifferentSlug =
      'https://d_gap.london.cloudapps.digital/grants/uk-tradeshow-programme-uktp-2';
    cy.get('[data-cy="cy-button-Confirm and publish"]').should('exist');
    cy.get('[data-cy="cy-button-Confirm and publish"]').click();
    cy.get('[data-cy="cy-advert-published"]').should(
      'have.text',
      'Grant advert published'
    );
    run_accessibility();
    cy.get('[data-cy="cy-link-to-advert"]').should('exist');
    cy.get('[data-cy="cy-link-to-advert"]')
      .should('have.text', linkToAdvertDifferentSlug)
      .should('have.attr', 'href', linkToAdvertDifferentSlug);

    //   Back to scheme
    cy.get('[data-cy="back-to-my-account-button"]').click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');

    cy.get('[data-cy="build-advert-component"]')
      .should('exist')
      .should('have.text', 'Grant advert');

    cy.get('[data-cy="cy-published-advert-extra-information"]').should('exist');
    cy.get('[data-cy="cy-information-published-status-tag-line"]')
      .should('exist')
      .should(
        'have.text',
        'You can make changes to your advert, or unpublish it, here:'
      );
    cy.get('[data-cy="cy-link-to-advert-on-find"]').should('exist');
    cy.get('[data-cy="cy-link-to-advert-on-find"]')
      .should('have.text', linkToAdvertDifferentSlug)
      .should('have.attr', 'href', linkToAdvertDifferentSlug);
  });
});
