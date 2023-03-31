import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import {
  checkDatesContent,
  getDateError,
  setDatesContent,
} from '../../utils/grantAdvertUtils/section3Utils';
import {
  checkLengthOfErrorsInErrorBanner,
  checkPageStatus,
  clickBackButton,
  clickSaveAndContinue,
  clickSaveAndExit,
  enterInPageAndCheckUrlContainRightSectionAndId,
  getErrorRelatedToRadio,
  selectRadioButtonNo,
  selectRadioButtonYes,
} from '../../utils/grantAdvertUtils/section5Utils';
import run_accessibility from '../../utils/run_accessibility';

let sectionOverviewPageURL;
const loginAndInitialiseAdvert = (name) => {
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

const PAGE_TITLE = 'Opening and closing dates';
const SECTION_NAME = 'applicationDates';
const SECTION_TITLE = 'Application dates';
const SECTION_ID = 3;
const PAGE_ID = '1';
const PAGE_INDEX = 0;
const OPEN_INPUT = 'grantApplicationOpenDate';
const CLOSE_INPUT = 'grantApplicationCloseDate';

describe('Section 3. Application Dates', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitialiseAdvert('section-four-how-to-apply');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });
  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  it('Should be able to access section 3 and populate the pages', () => {
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    run_accessibility();

    setDatesContent(OPEN_INPUT, '1', '2', '2022');
    setDatesContent(CLOSE_INPUT, '2', '2', '2022');

    clickBackButton();
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    checkDatesContent(OPEN_INPUT, '', '', '');
    checkDatesContent(CLOSE_INPUT, '', '', '');

    clickBackButton();

    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    checkPageStatus(SECTION_ID, SECTION_TITLE, 'Not Started', PAGE_INDEX);
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    // Have you completed this question components exists
    cy.get(`[data-cy="cy-question-page-caption-${SECTION_TITLE}"]`).contains(
      SECTION_TITLE
    );
    cy.get(`[data-cy="cy-completed-question-title"]`)
      .should('have.prop', 'tagName', 'H2')
      .and('have.text', 'Have you completed this question?');
    cy.get(
      `[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`
    ).should('not.be.checked');
    cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').contains(
      'Save and continue'
    );
    cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').contains(
      'Save and exit'
    );

    // Questions exist and have correct headings etc
    cy.get(`[data-cy="cy-${OPEN_INPUT}-question-title"]`)
      .should('have.prop', 'tagName', 'H2')
      .and('have.text', 'Opening date');
    cy.get(`[data-cy="cy-${OPEN_INPUT}-question-hint"]`).and(
      'have.text',
      'Your advert will be published on the opening date at 00:01am.\n\nFor example, 31 3 2023'
    );
    cy.get(`[data-cy="cy-${CLOSE_INPUT}-question-title"]`)
      .should('have.prop', 'tagName', 'H2')
      .and('have.text', 'Closing date');
    cy.get(`[data-cy="cy-${CLOSE_INPUT}-question-hint"]`).and(
      'have.text',
      'Your advert will be unpublished on the closing date at 23:59pm.\n\nFor example, 31 3 2023'
    );

    // Errors: All fields blank
    clickSaveAndContinue();
    checkLengthOfErrorsInErrorBanner(3);
    getErrorRelatedToRadio(
      "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
    );
    getDateError(OPEN_INPUT, 'day', 'Enter an opening date');
    getDateError(CLOSE_INPUT, 'day', 'Enter a closing date');

    // Errors: "Date must include a month and a year" & "Date must include a year"
    setDatesContent(OPEN_INPUT, '5', '', '');
    setDatesContent(CLOSE_INPUT, '5', '12', '');
    selectRadioButtonNo();

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '5', '', '');
    getDateError(
      OPEN_INPUT,
      'month',
      'Opening date must include a month and a year'
    );
    checkDatesContent(CLOSE_INPUT, '5', '12', '');
    getDateError(CLOSE_INPUT, 'year', 'Closing date must include a year');

    // Errors: "Date must include a month" & "Date must include a day"
    setDatesContent(OPEN_INPUT, '5', '', '2022');
    setDatesContent(CLOSE_INPUT, '', '12', '2022');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '5', '', '2022');
    getDateError(OPEN_INPUT, 'month', 'Opening date must include a month');
    checkDatesContent(CLOSE_INPUT, '', '12', '2022');
    getDateError(CLOSE_INPUT, 'day', 'Closing date must include a day');

    // Errors: "Date must include a day and a month" & "Date must include a real month": 13
    setDatesContent(OPEN_INPUT, '', '', '2022');
    setDatesContent(CLOSE_INPUT, '5', '13', '2022');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '', '', '2022');
    getDateError(
      OPEN_INPUT,
      'day',
      'Opening date must include a day and a month'
    );
    checkDatesContent(CLOSE_INPUT, '5', '13', '2022');
    getDateError(
      CLOSE_INPUT,
      'month',
      'Closing date must include a real month'
    );

    // Errors: "Date must include a real month": 0 & "Date must include a real month": -1
    setDatesContent(OPEN_INPUT, '5', '0', '2022');
    setDatesContent(CLOSE_INPUT, '5', '-1', '2022');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '5', '0', '2022');
    getDateError(OPEN_INPUT, 'month', 'Opening date must include a real month');
    checkDatesContent(CLOSE_INPUT, '5', '-1', '2022');
    getDateError(
      CLOSE_INPUT,
      'month',
      'Closing date must include a real month'
    );

    // Errors: "Date must include a real day": 0 & "Date must include a real day": -1
    setDatesContent(OPEN_INPUT, '0', '4', '2022');
    setDatesContent(CLOSE_INPUT, '-1', '3', '2022');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '0', '4', '2022');
    getDateError(OPEN_INPUT, 'day', 'Opening date must include a real day');
    checkDatesContent(CLOSE_INPUT, '-1', '3', '2022');
    getDateError(CLOSE_INPUT, 'day', 'Closing date must include a real day');

    // Errors: "Date must include a real day": 32 & "Date must include a real year": 359
    setDatesContent(OPEN_INPUT, '32', '4', '2022');
    setDatesContent(CLOSE_INPUT, '2', '3', '359');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '32', '4', '2022');
    getDateError(OPEN_INPUT, 'day', 'Opening date must include a real day');
    checkDatesContent(CLOSE_INPUT, '2', '3', '359');
    getDateError(CLOSE_INPUT, 'year', 'Closing date must include a real year');

    // Errors: "Date must include a real year": -2022 & "Date must include a real year": 10512
    setDatesContent(OPEN_INPUT, '28', '4', '-2022');
    setDatesContent(CLOSE_INPUT, '2', '3', '10512');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, '28', '4', '-2022');
    getDateError(OPEN_INPUT, 'year', 'Opening date must include a real year');
    checkDatesContent(CLOSE_INPUT, '2', '3', '10512');
    getDateError(CLOSE_INPUT, 'year', 'Closing date must include a real year');

    // Errors: "Date must include a real year": "test" & "Date must include a real year": "#"
    setDatesContent(OPEN_INPUT, 'test', '4', '2022');
    setDatesContent(CLOSE_INPUT, '2', '3', '#');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(2);
    checkDatesContent(OPEN_INPUT, 'test', '4', '2022');
    getDateError(OPEN_INPUT, 'day', 'Opening date must include a real day');
    checkDatesContent(CLOSE_INPUT, '2', '3', '#');
    getDateError(CLOSE_INPUT, 'year', 'Closing date must include a real year');

    // Errors: "The closing date must be later than the opening date"
    setDatesContent(OPEN_INPUT, '28', '4', '2022');
    setDatesContent(CLOSE_INPUT, '28', '4', '2022');

    clickSaveAndContinue();

    checkLengthOfErrorsInErrorBanner(1);
    checkDatesContent(OPEN_INPUT, '28', '4', '2022');
    checkDatesContent(CLOSE_INPUT, '28', '4', '2022');
    getDateError(
      CLOSE_INPUT,
      'day',
      'The closing date must be later than the opening date'
    );

    // Success path
    setDatesContent(OPEN_INPUT, '28', '4', '2022');
    setDatesContent(CLOSE_INPUT, '29', '4', '2022');

    clickSaveAndContinue();

    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    checkPageStatus(SECTION_ID, SECTION_TITLE, 'In Progress', PAGE_INDEX);
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    // Assert values are persisted
    checkDatesContent(OPEN_INPUT, '28', '4', '2022');
    checkDatesContent(CLOSE_INPUT, '29', '4', '2022');

    setDatesContent(OPEN_INPUT, '24', '3', '2021');
    selectRadioButtonYes();
    clickSaveAndContinue();

    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    checkPageStatus(SECTION_ID, SECTION_TITLE, 'Completed', PAGE_INDEX);
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    // Assert new values are persisted
    checkDatesContent(OPEN_INPUT, '24', '3', '2021');
    checkDatesContent(CLOSE_INPUT, '29', '4', '2022');

    selectRadioButtonYes();
    clickSaveAndExit();

    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    checkPageStatus(SECTION_ID, SECTION_TITLE, 'Completed', PAGE_INDEX);
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_TITLE,
      SECTION_TITLE,
      SECTION_NAME,
      SECTION_ID,
      PAGE_ID
    );

    clickBackButton();
    cy.get('[data-cy="cy-summary-overview-header"]').should(
      'have.text',
      'Create an advert'
    );
    checkPageStatus(SECTION_ID, SECTION_TITLE, 'Completed', PAGE_INDEX);
  });
});
