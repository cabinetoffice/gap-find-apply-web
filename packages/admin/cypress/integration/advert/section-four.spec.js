import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import {
  checkErrorBannerErrorsAndRespectiveLinks,
  checkInputContent,
  enterInPageAddValueAndPressBackAndReEnterAndCheckInputIsEmpty,
  setInputContent,
} from '../../utils/grantAdvertUtils/section4Utils';
import {
  checkFirstAccessToThePage,
  checkLengthOfErrorsInErrorBanner,
  checkPageStatus,
  clickSaveAndContinue,
  clickSaveAndExit,
  getErrorRelatedToRadio,
  selectRadioButtonYes,
} from '../../utils/grantAdvertUtils/section5Utils';

const SECTION_4_TITLE = 'How to apply';
const SECTION_4_NAME = 'howToApply';
const SECTION_4_ID = 4;
const COMPLETED = 'Completed';
const IN_PROGRESS = 'In Progress';
const NOT_STARTED = 'Not Started';
const SECTION_4_TEXT_ADDED = 'Lorem, ipsum dolor ';
const SECTION_4_TEXT_URL = 'http://www.google.com';
const SECTION_4_SHORT_URL_CASE1 = 'https://tinyurl.com/decs4kpn';
const SECTION_4_SHORT_URL_CASE2 = 'https://bit.ly/3Bg19uM';
const SECTION_4_SHORT_URL_CASE3 = 'http://ow.ly/d9AV30jRJWJ';
const SECTION_4_MANDATORY_QUESTION_ERROR =
  'Enter a link where applicants can apply';
const SECTION_4_STANDARD_QUESTION_ERROR = 'You must enter a valid link';
const SECTION_4_SHORT_URL_QUESTION_ERROR = 'You must enter the full link';
const SECTION_4_RADIO_ERROR =
  "Select 'Yes, I've completed this question', or 'No, I'll come back later'";
let sectionOverviewPageURL;
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

describe('Section 4. How to apply - Advert builder', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitiliaseAdvert('section-four-how-to-apply');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });
  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  const PAGE_1_QUESTION_TITLE = 'Add a link so applicants know where to apply';
  const PAGE_1_FIELD_NAME = 'grantWebpageUrl';
  const PAGE_1_QUESTION_HINT =
    'Applicants will be directed to this link when they select "Start new application" \n\nEnter a link that all applicants can access. The link must begin with "https://".';
  const PAGE_1_TITLE = 'Link to application form';
  const PAGE_1_ID = 1;
  const PAGE_1_QUESTION_INDEX = 0;

  it('Should be able to access section 4 and populate the pages', () => {
    cy.log(
      'page 1 - Enter in the page, add something to tiny mce, press back, reenter, check no value is in tiny mce, and go back to section-overview page'
    );
    enterInPageAddValueAndPressBackAndReEnterAndCheckInputIsEmpty(
      PAGE_1_TITLE,
      SECTION_4_TITLE,
      SECTION_4_NAME,
      SECTION_4_ID,
      PAGE_1_ID,
      SECTION_4_TEXT_ADDED,
      PAGE_1_FIELD_NAME
    );

    //cy.log('section overview - checking page 1 status,link and content');
    checkFirstAccessToThePage(
      PAGE_1_TITLE,
      SECTION_4_NAME,
      SECTION_4_TITLE,
      SECTION_4_ID,
      PAGE_1_FIELD_NAME,
      PAGE_1_QUESTION_TITLE,
      PAGE_1_QUESTION_HINT,
      NOT_STARTED,
      PAGE_1_ID,
      PAGE_1_QUESTION_INDEX
    );

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner'); page 1 is  mandatory
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_4_MANDATORY_QUESTION_ERROR,
      SECTION_4_RADIO_ERROR
    );

    // cy.log('page 1 set input content'); // NOT an URL
    setInputContent(SECTION_4_TEXT_ADDED, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_4_STANDARD_QUESTION_ERROR,
      SECTION_4_RADIO_ERROR
    );

    // cy.log('page 1 set input content'); // short URL- 1
    setInputContent(SECTION_4_SHORT_URL_CASE1, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_4_SHORT_URL_QUESTION_ERROR,
      SECTION_4_RADIO_ERROR
    );

    // cy.log('page 1 set input content'); //short URL- 2
    setInputContent(SECTION_4_SHORT_URL_CASE2, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_4_SHORT_URL_QUESTION_ERROR,
      SECTION_4_RADIO_ERROR
    );

    // cy.log('page 1 set input content'); //short URL- 3
    setInputContent(SECTION_4_SHORT_URL_CASE3, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_4_SHORT_URL_QUESTION_ERROR,
      SECTION_4_RADIO_ERROR
    );

    // cy.log('page 1 set input content'); //an URL
    setInputContent(SECTION_4_TEXT_URL, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner'); page 1 is non mandatory
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_4_RADIO_ERROR);

    //cy.log('page 1 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 1 - Eligibility information__Mandatory Input__use save and exit');
    //cy.log('section overview - checking page 1 status,link and content');
    checkFirstAccessToThePage(
      PAGE_1_TITLE,
      SECTION_4_NAME,
      SECTION_4_TITLE,
      SECTION_4_ID,
      PAGE_1_FIELD_NAME,
      PAGE_1_QUESTION_TITLE,
      PAGE_1_QUESTION_HINT,
      COMPLETED,
      PAGE_1_ID,
      PAGE_1_QUESTION_INDEX
    );

    //cy.log('page 1 check content of input');
    checkInputContent(SECTION_4_TEXT_URL, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and exit');
    clickSaveAndExit();

    //cy.log('page 1 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_4_RADIO_ERROR);

    //cy.log('page 1 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 1 click save and exit');
    clickSaveAndExit();

    //cy.log('page 1 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 1 check status');
    checkPageStatus(
      SECTION_4_ID,
      SECTION_4_TITLE,
      COMPLETED,
      PAGE_1_QUESTION_INDEX
    );
  });
});
