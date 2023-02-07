import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import {
  checkContentOfTinyMce,
  checkErrorBannerErrorsAndRespectiveLinks,
  checkFirstAccessToThePage,
  checkLengthOfErrorsInErrorBanner,
  checkPageStatus,
  clickSaveAndContinue,
  clickSaveAndExit,
  enterInPageAddValueAndPressBackAndReEnterAndCheckTinyMceIsEmpty,
  enterInPageAndCheckUrlContainRightSectionAndId,
  getErrorRelatedToRadio,
  selectRadioButtonNo,
  selectRadioButtonYes,
} from '../../utils/grantAdvertUtils/section5Utils';

const SECTION_5_TITLE = 'Further information';
const SECTION_5_NAME = 'furtherInformation';
const COMPLETED = 'Completed';
const IN_PROGRESS = 'In Progress';
const NOT_STARTED = 'Not Started';
const SECTION_5_TEXT_ADDED =
  'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias ipsa, sequi rem recusandae unde, laboriosam dolorum suscipit aliquid a facere animi, fuga laudantium quod doloribus nulla veniam accusantium non vero.';

const SECTION_5_PAGE_ONE_ERROR = 'You must enter eligibility information';
const SECTION_5_PAGE_TWO_ERROR = 'You must enter a description of your grant';
const SECTION_5_PAGE_FOUR_ERROR = 'You must enter the objectives of your grant';
const SECTION_5_PAGE_FIVE_ERROR = 'You must add information about where to apply for your grant';

const SECTION_5_RADIO_ERROR =
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

describe('Section 5. Further information - Advert builder', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitiliaseAdvert('section-five-further-information');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });
  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  const PAGE_1_QUESTION_TITLE = 'Add eligibility information for your grant';
  const PAGE_1_FIELD_NAME = 'grantEligibilityTab';
  const PAGE_1_QUESTION_HINT =
    'Add information to help the applicant know if they are eligible to apply for this grant or not. \n\nHaving a clear eligibility criteria means time and money are not spent processing applications from organisations that are not eligible.';
  const PAGE_1_TITLE = 'Eligibility information';
  const PAGE_1_ID = 1;
  const PAGE_2_QUESTION_TITLE = 'Add a long description of your grant';
  const PAGE_2_FIELD_NAME = 'grantSummaryTab';
  const PAGE_2_QUESTION_HINT =
    'In this section you can add a longer description of the grant.';
  const PAGE_2_TITLE = 'Long description';
  const PAGE_2_ID = 2;
  const PAGE_3_QUESTION_TITLE =
    'Add details about any relevant dates (optional)';
  const PAGE_3_FIELD_NAME = 'grantDatesTab';
  const PAGE_3_QUESTION_HINT =
    'You might want to include information about when the applicant will know if they have been successful or the date the funding must be spent by.';
  const PAGE_3_TITLE = 'Relevant dates';
  const PAGE_3_ID = 3;
  const PAGE_4_QUESTION_TITLE =
    'Add details about the objectives of your grant';
  const PAGE_4_FIELD_NAME = 'grantObjectivesTab';
  const PAGE_4_QUESTION_HINT =
    'This should include information about what the grant is trying to achieve.';
  const PAGE_4_TITLE = 'Scheme objectives';
  const PAGE_4_ID = 4;
  const PAGE_5_QUESTION_TITLE =
    'Add information about how to apply for your grant';
  const PAGE_5_FIELD_NAME = 'grantApplyTab';
  const PAGE_5_QUESTION_HINT =
    'Add any additional information about how the applicant will need to apply. This section is useful if you need to give a link to a website or a document they need to email to you.';
  const PAGE_5_TITLE = 'How to apply';
  const PAGE_5_ID = 5;
  const PAGE_6_QUESTION_TITLE =
    'Add links to any supporting information (optional)';
  const PAGE_6_FIELD_NAME = 'grantSupportingInfoTab';
  const PAGE_6_QUESTION_HINT =
    'You might want to link to documents or websites that will give applicants more information about your grant.';
  const PAGE_6_TITLE = 'Supporting information';
  const PAGE_6_ID = 6;
  it('Should be able to access section 5 and populate the pages', () => {
    //cy.log('page 1 - Eligibility information__Mandatory Input__use save and continue');
    //cy.log('page 1 - Enter in the page, add something to tiny mce, press back, reenter, check no value is in tiny mce, and go back to section-overview page');
    enterInPageAddValueAndPressBackAndReEnterAndCheckTinyMceIsEmpty(
      PAGE_1_TITLE,
      SECTION_5_NAME,
      PAGE_1_ID,
      SECTION_5_TEXT_ADDED,
      PAGE_1_FIELD_NAME
    );
    //cy.log('section overview - checking page 1 status,link and content');
    checkFirstAccessToThePage(
      PAGE_1_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_1_FIELD_NAME,
      PAGE_1_QUESTION_TITLE,
      PAGE_1_QUESTION_HINT,
      NOT_STARTED,
      PAGE_1_ID
    );
    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_1_FIELD_NAME,
      SECTION_5_PAGE_ONE_ERROR,
      SECTION_5_RADIO_ERROR
    );

    //cy.log('page 1 set tinymce content');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_1_FIELD_NAME);

    //cy.log('page 1 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 1 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 1 select no radio');
    selectRadioButtonNo();

    //cy.log('page 1 click Save and continue');
    clickSaveAndExit();

    //cy.log('page 1 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - re-enter and check page 1 status,link and content');
    checkFirstAccessToThePage(
      PAGE_1_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_1_FIELD_NAME,
      PAGE_1_QUESTION_TITLE,
      PAGE_1_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_1_ID
    );

    //cy.log('page 1 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 1 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 1 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 1 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 1 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 1 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 1 click save and exit');
    clickSaveAndExit();

    //cy.log('page 1 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 1 check page status is completed');
    checkPageStatus(PAGE_1_TITLE, COMPLETED);

    /// PAGE 2

    //cy.log('page 2 - Long description__Mandatory Input__use save and continue');

    //cy.log('section overview - checking page 2 status,link and content');
    checkFirstAccessToThePage(
      PAGE_2_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_2_FIELD_NAME,
      PAGE_2_QUESTION_TITLE,
      PAGE_2_QUESTION_HINT,
      NOT_STARTED,
      PAGE_2_ID
    );

    //cy.log('page 2 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 2 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_2_FIELD_NAME,
      SECTION_5_PAGE_TWO_ERROR,
      SECTION_5_RADIO_ERROR
    );

    //cy.log('page 2 set tinymce content');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_2_FIELD_NAME);

    //cy.log('page 2 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 2 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 2 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 2 select no radio');
    selectRadioButtonNo();

    //cy.log('page 2 click Save and exit');
    clickSaveAndExit();

    //cy.log('page 2 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - re-enter and check page 2 status,link and content');
    checkFirstAccessToThePage(
      PAGE_2_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_2_FIELD_NAME,
      PAGE_2_QUESTION_TITLE,
      PAGE_2_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_2_ID
    );

    //cy.log('page 2 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 2 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 2 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 2 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 2 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 2 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 2 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 2 click save and exit');
    clickSaveAndExit();

    //cy.log('page 2 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 2 check status');
    checkPageStatus(PAGE_2_TITLE, COMPLETED);

    //// PAGE 3
    //cy.log('page 3 - Relevant dates__Non Mandatory Input__use save and continue');

    //cy.log('section overview - checking page 3 status,link and content');
    checkFirstAccessToThePage(
      PAGE_3_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_3_FIELD_NAME,
      PAGE_3_QUESTION_TITLE,
      PAGE_3_QUESTION_HINT,
      NOT_STARTED,
      PAGE_3_ID
    );

    //cy.log('page 3 click save and continue');
    clickSaveAndContinue();

    //this page is not mandatory, so only one error received
    //cy.log('page 3 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 3 select no radio');
    selectRadioButtonNo();

    //cy.log('page 3 click save and exit');
    clickSaveAndExit();

    //cy.log('page 3 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - checking page 3 status,link and content');
    checkFirstAccessToThePage(
      PAGE_3_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_3_FIELD_NAME,
      PAGE_3_QUESTION_TITLE,
      PAGE_3_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_3_ID
    );

    //cy.log('page 3 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 3 click save and exit');
    clickSaveAndExit();

    //cy.log('page 3 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //adding text on non mandatory field
    //cy.log('section overview - checking page 3 status,link and content');
    checkFirstAccessToThePage(
      PAGE_3_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_3_FIELD_NAME,
      PAGE_3_QUESTION_TITLE,
      PAGE_3_QUESTION_HINT,
      COMPLETED,
      PAGE_3_ID
    );

    //cy.log('page 3 set tinymce value and check it');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_3_FIELD_NAME);
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 2 click save and exit');
    clickSaveAndExit();

    //cy.log('page 3 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 3 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 3 click save and exit');
    clickSaveAndExit();

    //cy.log('page 3 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 3 check status');
    checkPageStatus(PAGE_3_TITLE, COMPLETED);

    /////////////////////////////// PAGE4

    //cy.log('page 4 - Scheme objectives__Mandatory Input__use save and continue');

    //cy.log('section overview - checking page 4 status,link and content');
    checkFirstAccessToThePage(
      PAGE_4_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_4_FIELD_NAME,
      PAGE_4_QUESTION_TITLE,
      PAGE_4_QUESTION_HINT,
      NOT_STARTED,
      PAGE_4_ID
    );
    //cy.log('page 4 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 4 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_4_FIELD_NAME,
      SECTION_5_PAGE_FOUR_ERROR,
      SECTION_5_RADIO_ERROR
    );

    //cy.log('page 4 set tinymce content');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_4_FIELD_NAME);

    //cy.log('page 4 check tinymce content');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 4 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 4 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 4 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 4 select no radio');
    selectRadioButtonNo();

    //cy.log('page 4 click Save and exit');
    clickSaveAndExit();

    //cy.log('page 4 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - re-enter and check page 4 status,link and content');
    checkFirstAccessToThePage(
      PAGE_4_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_4_FIELD_NAME,
      PAGE_4_QUESTION_TITLE,
      PAGE_4_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_4_ID
    );

    //cy.log('page 4 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 4 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 4 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 4 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 4 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 4 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 4 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 4 click save and exit');
    clickSaveAndExit();

    //cy.log('page 4 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 4 check status');
    checkPageStatus(PAGE_4_TITLE, COMPLETED);

    /////////////////////////////// PAGE5

    //cy.log('page 5 - How to apply__Mandatory Input__use save and continue');

    //cy.log('section overview - checking page 5 status,link and content');
    checkFirstAccessToThePage(
      PAGE_5_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_5_FIELD_NAME,
      PAGE_5_QUESTION_TITLE,
      PAGE_5_QUESTION_HINT,
      NOT_STARTED,
      PAGE_5_ID
    );
    //cy.log('page 5 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 5 check errors in banner');
    checkErrorBannerErrorsAndRespectiveLinks(
      2,
      PAGE_5_FIELD_NAME,
      SECTION_5_PAGE_FIVE_ERROR,
      SECTION_5_RADIO_ERROR
    );

    //cy.log('page 5 set tinymce content');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_5_FIELD_NAME);
    //cy.log('page 5 check tinymce content');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);
    //cy.log('page 5 click save and continue');
    clickSaveAndContinue();

    //cy.log('page 5 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 5 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 5 select no radio');
    selectRadioButtonNo();

    //cy.log('page 5 click Save and exit');
    clickSaveAndExit();

    //cy.log('page 5 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - re-enter and check page 5 status,link and content');
    checkFirstAccessToThePage(
      PAGE_5_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_5_FIELD_NAME,
      PAGE_5_QUESTION_TITLE,
      PAGE_5_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_5_ID
    );

    //cy.log('page 5 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 5 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 5 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 5 click Save and continue');
    clickSaveAndContinue();

    //cy.log('page 5 check content of tinymce');
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 5 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 5 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 5 click save and exit');
    clickSaveAndExit();

    //cy.log('page 5 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 5 check status');
    checkPageStatus(PAGE_5_TITLE, COMPLETED);

    ////////////////////////PAGE 6

    //cy.log('page 6 - Supporting information__Non Mandatory Input__use save and continue');

    //cy.log('section overview - checking page 6 status,link and content');
    checkFirstAccessToThePage(
      PAGE_6_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_6_FIELD_NAME,
      PAGE_6_QUESTION_TITLE,
      PAGE_6_QUESTION_HINT,
      NOT_STARTED,
      PAGE_6_ID
    );

    //cy.log('page 6 click save and continue');
    clickSaveAndContinue();

    //this page is not mandatory, so only one error received
    //cy.log('page 6 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 2 select no radio');
    selectRadioButtonNo();

    //cy.log('page 6 click save and exit');
    clickSaveAndExit();

    //cy.log('page 6 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('section overview - checking page 6 status,link and content');
    checkFirstAccessToThePage(
      PAGE_6_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_6_FIELD_NAME,
      PAGE_6_QUESTION_TITLE,
      PAGE_6_QUESTION_HINT,
      IN_PROGRESS,
      PAGE_6_ID
    );

    //cy.log('page 6 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 6 click save and exit');
    clickSaveAndExit();

    //cy.log('page 6 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //adding text on non mandatory field
    //cy.log('section overview - checking page 6 status,link and content');
    checkFirstAccessToThePage(
      PAGE_6_TITLE,
      SECTION_5_NAME,
      SECTION_5_TITLE,
      PAGE_6_FIELD_NAME,
      PAGE_6_QUESTION_TITLE,
      PAGE_6_QUESTION_HINT,
      COMPLETED,
      PAGE_6_ID
    );

    //cy.log('page 6 set tinymce value and check it');
    cy.setTinyMceContent(SECTION_5_TEXT_ADDED, PAGE_6_FIELD_NAME);
    checkContentOfTinyMce(SECTION_5_TEXT_ADDED);

    //cy.log('page 2 click save and exit');
    clickSaveAndExit();

    //cy.log('page 6 check errors in banner');
    checkLengthOfErrorsInErrorBanner(1);
    getErrorRelatedToRadio(SECTION_5_RADIO_ERROR);

    //cy.log('page 6 select yes radio');
    selectRadioButtonYes();

    //cy.log('page 6 click save and exit');
    clickSaveAndExit();

    //cy.log('page 6 check redirection to section-overview page');
    cy.url().should('include', '/section-overview');

    //cy.log('page 6 check status');
    checkPageStatus(PAGE_6_TITLE, COMPLETED);

    // now need to test save and continue
    // Page 1
    enterInPageAndCheckUrlContainRightSectionAndId(
      PAGE_1_TITLE,
      SECTION_5_NAME,
      PAGE_1_ID
    );

    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 1 to page 2
    cy.url().should('include', `${SECTION_5_NAME}/${PAGE_2_ID}`);

    // page 2
    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 2 to page 3
    cy.url().should('include', `${SECTION_5_NAME}/${PAGE_3_ID}`);

    // page 3
    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 3 to page 4
    cy.url().should('include', `${SECTION_5_NAME}/${PAGE_4_ID}`);

    // page 4
    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 4 to page 5
    cy.url().should('include', `${SECTION_5_NAME}/${PAGE_5_ID}`);

    // page 5
    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 5 to page 6
    cy.url().should('include', `${SECTION_5_NAME}/${PAGE_6_ID}`);

    // page 6
    selectRadioButtonYes();
    clickSaveAndContinue(); // moves from page 6 to section overview
    cy.url().should('include', '/section-overview');
  });
});
