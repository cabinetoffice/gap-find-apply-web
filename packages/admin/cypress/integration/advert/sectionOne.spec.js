import addAdvertToScheme from '../../utils/addAdvertToScheme';
import checkErrorBanner from '../../utils/checkErrorBanner';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import advertCheckCompleteSection from '../../utils/grantAdvertUtils/advertCheckComplete';
import advertCheckSectionStatus from '../../utils/grantAdvertUtils/advertCheckStatusTags';
import run_accessibility from '../../utils/run_accessibility';
let sectionOverviewPageURL;

// Authentication for the admin side
const loginAndInitiliaseAdvert = (name) => {
  cy.session(
    `${name}`,
    () => {
      cy.visit('/');
    },
    {
      validate() {
        cy.visit('/');
        deleteExistingGrantAdvert();
        addAdvertToScheme('Test advert name');
        cy.url()
          .should('include', '/section-overview')
          .then((url) => {
            sectionOverviewPageURL = url;
          });
      },
    }
  );
};

/*

E2E:
Creating an advert, filling up questions from each section, publishing, unpublish, or update. 
1. inputs should contain extremes, 255character. 

Sections:
1. a grant, for each section, we will test validations and each question thoroughly. 

*/

describe('Section on Grant details - Advert builder', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitiliaseAdvert('section-one-grant-details');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });
  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  it('Should be able to fill out section 1 - Short description', () => {
    //section overview - checking status and link content
    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    let sectionTitle = 'Short description';
    cy.get(`[data-cy="cy-status-tag-${sectionTitle}-Not Started"]`)
      .should('have.text', 'Not Started')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--grey');

    cy.get(`[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`)
      .contains(sectionTitle)
      .and('have.attr', 'href')
      .and('include', 'grantDetails/1');

    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.url().should('include', 'grantDetails/1');
    cy.get(`[data-cy="cy-grantShortDescription-question-title"]`).should(
      'have.text',
      'Add a short description of the grant'
    );

    run_accessibility();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();

    // check accessibility and the errors. Should have two errors.
    checkErrorBanner('grantShortDescription', 'Enter a short description');
    checkErrorBanner(
      'completed',
      "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
    );

    cy.get(`[data-cy="cy-grantShortDescription-text-area"]`).type(
      'a'.repeat(801),
      { delay: 0 }
    );

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();

    checkErrorBanner(
      'grantShortDescription',
      'Short description must be 800 characters or less'
    );

    cy.get(`[data-cy="cy-grantShortDescription-text-area"]`).clear();
    cy.get(`[data-cy="cy-grantShortDescription-text-area"]`).type(
      'test description'
    );

    advertCheckCompleteSection();
    advertCheckSectionStatus(
      sectionTitle,
      'cy-grantShortDescription-text-area',
      'test description',
      false
    );

    // should redirect to question 2 in the section when save and continue is clicked
    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.url().should('include', 'grantDetails/2');
  });

  it('Should be able to fill out section 1 - Location', () => {
    //section overview - checking status and link content
    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    let sectionTitle = 'Location';
    cy.get(`[data-cy="cy-status-tag-${sectionTitle}-Not Started"]`)
      .should('have.text', 'Not Started')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--grey');

    cy.get(`[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`)
      .contains(sectionTitle)
      .and('have.attr', 'href')
      .and('include', 'grantDetails/2');

    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.url().should('include', 'grantDetails/2');
    cy.get(`[data-cy="cy-grantLocation-question-title"]`).should(
      'have.text',
      'Where is the grant available?'
    );
    run_accessibility();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    checkErrorBanner('grantLocation', 'You must select at least one location');
    checkErrorBanner(
      'completed',
      "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
    );

    cy.get(`[data-cy="cy-checkbox-value-England"]`).click();
    cy.get(`[data-cy="cy-checkbox-value-Scotland"]`).click();

    cy.get(`[data-cy="cy-checkbox-value-National"]`).should('not.be.checked');

    cy.get(`[data-cy="cy-checkbox-value-National"]`).click();
    cy.get(`[data-cy="cy-checkbox-value-England"]`).should('not.be.checked');
    cy.get(`[data-cy="cy-checkbox-value-Scotland"]`).should('not.be.checked');

    advertCheckCompleteSection();
    advertCheckSectionStatus(
      sectionTitle,
      'cy-checkbox-value-National',
      true,
      true
    );

    // should redirect to question 3 in the section when save and continue is clicked
    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.url().should('include', 'grantDetails/3');
  });

  it('Should be able to fill out section 1 - Funding organisation', () => {
    //section overview - checking status and link content
    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    let sectionTitle = 'Funding organisation';
    cy.get(`[data-cy="cy-status-tag-${sectionTitle}-Not Started"]`)
      .should('have.text', 'Not Started')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--grey');

    cy.get(`[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`)
      .contains(sectionTitle)
      .and('have.attr', 'href')
      .and('include', 'grantDetails/3');

    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.url().should('include', 'grantDetails/3');
    cy.get(`[data-cy="cy-grantFunder-question-title"]`).should(
      'have.text',
      'Which organisation is funding this grant?'
    );
    run_accessibility();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    checkErrorBanner('grantFunder', 'You must enter an answer');
    checkErrorBanner(
      'completed',
      "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
    );

    cy.get(`[data-cy="cy-grantFunder-text-input"]`).type('a'.repeat(257), {
      delay: 0,
    });

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    checkErrorBanner('grantFunder', 'Your answer must be 256 characters or less');

    cy.get(`[data-cy="cy-grantFunder-text-input"]`).clear();
    cy.get(`[data-cy="cy-grantFunder-text-input"]`).type('test funder');

    advertCheckCompleteSection();
    advertCheckSectionStatus(
      sectionTitle,
      'cy-grantFunder-text-input',
      'test funder',
      false
    );

    // should redirect to question 4 in the section when save and continue is clicked
    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.url().should('include', 'grantDetails/4');
  });

  it('Should be able to fill out section 1 - Who can apply', () => {
    //section overview - checking status and link content
    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    let sectionTitle = 'Who can apply';
    cy.get(`[data-cy="cy-status-tag-${sectionTitle}-Not Started"]`)
      .should('have.text', 'Not Started')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--grey');

    cy.get(`[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`)
      .contains(sectionTitle)
      .and('have.attr', 'href')
      .and('include', 'grantDetails/4');

    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.url().should('include', 'grantDetails/4');
    cy.get(`[data-cy="cy-grantApplicantType-question-title"]`).should(
      'have.text',
      'Who can apply for this grant?'
    );
    run_accessibility();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    checkErrorBanner('grantApplicantType', 'You must select at least one option');
    checkErrorBanner(
      'completed',
      "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
    );

    cy.get(`[data-cy="cy-checkbox-value-Personal / Individual"]`).click();

    advertCheckCompleteSection();
    advertCheckSectionStatus(
      sectionTitle,
      'cy-checkbox-value-Personal / Individual',
      true,
      true
    );

    // final question in the section should redirect back to section overview when save and continue is clicked
    cy.get(
      `[data-cy="cy-advert-section-overview-page-${sectionTitle}"]`
    ).click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
    ).click();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
    cy.url().should('include', 'section-overview');
  });
});
