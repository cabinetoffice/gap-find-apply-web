import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import run_accessibility from '../../utils/run_accessibility';

let sectionOverviewPageURL;
let advertId;
// Authentication for the admin side
const loginAndInitializeAdvert = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        deleteExistingGrantAdvert();
        cy.visit('/');
        addAdvertToScheme('Test advert name');
        cy.url()
          .should('include', '/section-overview')
          .then((url) => {
            sectionOverviewPageURL = url;
            advertId = url //url = http://localhost:3000/apply/admin/scheme/3/advert/fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview
              .substring(url.indexOf('/advert/') + '/advert/'.length) // fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d/section-overview
              .split('/')[0]; // fa8f4b1d-d090-4ff6-97be-ccabd3b1d87d
          });
      },
    }
  );
};

describe('Section-overview', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitializeAdvert('Section Overview');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });

  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  it('Should have no accessibility violations on Grant advert Summary page', () => {
    cy.get('[data-testid="question-page-caption"]')
      .should('be.visible')
      .should('have.text', 'Test advert name');
    cy.get('[data-cy="cy-summary-overview-header"]')
      .should('be.visible')
      .should('have.text', 'Create an advert');
    run_accessibility();
  });

  it('Should render the help text and descriptions', () => {
    cy.get('[data-cy="cy-summary-overview-help-text"]')
      .should('be.visible')
      .should('have.text', 'How to create an advert:');

    cy.get('[data-cy="cy-summary-overview-help-text-bullet-1"]')
      .should('be.visible')
      .should('have.text', 'you must complete each section below');
    cy.get('[data-cy="cy-summary-overview-help-text-bullet-2"]')
      .should('be.visible')
      .should(
        'have.text',
        'once all sections are complete you can publish your advert'
      );
    cy.get('[data-cy="cy-summary-overview-help-text-bullet-3"]')
      .should('be.visible')
      .should('have.text', 'you can save your progress and come back later');
    cy.get('[data-cy="cy-summary-overview-help-text-2"]')
      .should('be.visible')
      .should(
        'have.text',
        'This advert will be published on Find a Grant (opens in new tab).'
      )
      .find('a')
      .should(
        'have.attr',
        'href',
        'https://www.find-government-grants.service.gov.uk/'
      );
  });

  it('Should render the task-list', () => {
    cy.get('[data-cy="cy-task-list-heading-1. Grant details"]')
      .should('be.visible')
      .should('have.text', '1. Grant details');
    cy.get('[data-cy="cy-1. Grant details-sublist-task-name-Short description"]')
      .should('be.visible')
      .should('have.text', 'Short description');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-status-0"]')
      .should('be.visible')
      .should('have.text', 'Not Started');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-name-Location"]')
      .should('be.visible')
      .should('have.text', 'Location');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-status-1"]')
      .should('be.visible')
      .should('have.text', 'Not Started');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-name-Funding organisation"]')
      .should('be.visible')
      .should('have.text', 'Funding organisation');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-status-2"]')
      .should('be.visible')
      .should('have.text', 'Not Started');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-name-Who can apply"]')
      .should('be.visible')
      .should('have.text', 'Who can apply');

    cy.get('[data-cy="cy-1. Grant details-sublist-task-status-3"]')
      .should('be.visible')
      .should('have.text', 'Not Started');

    cy.get('[data-cy="cy-task-list-heading-2. Award amounts"]')
      .should('be.visible')
      .should('have.text', '2. Award amounts');
    cy.get('[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]')
      .should('be.visible')
      .should('have.text', 'How much funding is available?');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('be.visible')
      .should('have.text', 'Not Started');
  });

  it('should have the text at the bottom of the page', () => {
    cy.get('[data-cy="cy-confirm-publish-header"]')
      .should('be.visible')
      .should('have.text', 'Publish your advert');
    cy.get('[data-cy="cy-confirm-publish--help-text"]')
      .should('be.visible')
      .should(
        'have.text',
        'If you have finished creating your advert, you can publish it on Find a grant.You will be able to check your advert again before it is published.'
      );
  });

  it('should have the button and exit at the bottom of the page', () => {
    cy.get('[data-cy="cy-publish-advert-button"]')
      .should('be.visible')
      .should('have.attr', 'disabled', 'disabled')
      .should('have.text', 'Review and publish');
    cy.get('[data-cy="cy-exit"]')
      .should('be.visible')
      .should('have.attr', 'href', '/apply/admin/scheme/3');
  });

  it('should have the back button ', () => {
    cy.get('[data-cy="cy-back-button"]')
      .should('be.visible')
      .should('have.attr', 'href', '/apply/admin/scheme/3');
  });

  it('should have the sideBar for preview', () => {
    cy.get('[data-cy="cy-preview-advert-sidebar-title"]')
      .should('be.visible')
      .should('have.text', 'Preview your advert');
    cy.get('[data-cy="cy-preview-advert-sidebar-content"]')
      .should('be.visible')
      .should(
        'have.text',
        'See how your advert will appear to applicants on Find a grant.'
      );
    cy.get('[data-cy="cy-preview-advert-sidebar-link"]')
      .should('be.visible')
      .should(
        'have.attr',
        'href',
        `/apply/admin/scheme/3/advert/${advertId}/preview`
      );
  });
});
