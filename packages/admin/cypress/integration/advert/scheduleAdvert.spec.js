import run_accessibility from '../../utils/run_accessibility';
import { unscheduleExistingAdvert } from '../../utils/grantAdvertUtils/unscheduleTestAdvert';
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

describe('Schedule grant advert', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndVisitAdvertSummary('advert-schedule');
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

  it('should schedule the advert', () => {
    cy.get('[data-cy="cy-advert-summary-footer-text"]').should('exist');
    cy.get('[data-cy="cy-advert-summary-footer-text"]').should(
      'have.text',
      'Your advert will be published automatically on the opening date.It will be unpublished automatically on the closing date.'
    );

    cy.get('[data-cy="cy-button-Schedule my advert"]').should('exist');
    cy.get('[data-cy="cy-button-Schedule my advert"]').click();
    cy.get('[data-cy="cy-advert-scheduled"]').should(
      'have.text',
      'Grant advert successfully scheduled'
    );
    run_accessibility();
    //   Back to scheme
    cy.get('[data-cy="back-to-my-account-button"]').click();
    cy.visit('/scheme/6');
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').should('exist');

    const viewOrChangeLink =
      '/apply/admin/scheme/6/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87e/summary';
    const viewOrChangeLinkText = 'View or change your advert';

    cy.get('[data-cy="build-advert-component"]')
      .should('exist')
      .should('have.text', 'Grant advert');

    cy.get('[  data-cy="cy-published-advert-extra-information"]').should(
      'not.exist'
    );
    cy.get('[data-cy="cy-information-published-status-tag-line"]')
      .should('exist')
      .should(
        'have.text',
        'Your advert is scheduled to be published on 30 March 2122'
      );
    cy.get('[data-cy="cy-link-to-advert-on-find"]').should('not.exist');

    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]')
      .should('have.text', viewOrChangeLinkText)
      .should('have.attr', 'href', viewOrChangeLink);

    // check status
    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]').should('exist').click();
    cy.get('[data-cy="cy-status-tag-SCHEDULED"]').should(
      'have.text',
      'Advert status: SCHEDULED'
    );

    cy.get('[data-cy="cy-summary-heading"]').should(
      'have.text',
      'Your grant advert'
    );

    // Renders unschedule section

    cy.get('[data-cy="cy-confirm-unschedule-header"]')
      .contains('This advert is scheduled')
      .and('have.prop', 'tagName', 'H2');

    cy.get('[data-cy="cy-confirm-unschedule-help-text-1"]').contains(
      'Your advert will be added to Find a grant automatically on the opening date.'
    );
    cy.get('[data-cy="cy-confirm-unschedule-help-text-2"]').contains(
      'If you need to, you can make changes to your advert.'
    );

    cy.get('[data-cy="cy-unschedule-advert-button"]')
      .should('have.text', 'Make changes to my advert')
      .and('have.attr', 'href')
      .and('includes', '/unschedule-confirmation');

    // Navigtation/Redirection checks
    summaryPageNavigationChecks(
      '/scheme/6/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87e/section-overview'
    );
  });
});
