import addAdvertToScheme from '../../utils/addAdvertToScheme';
import {
  deleteExistingGrantAdvert,
  deleteTestAdvert,
} from '../../utils/deleteTestAdverts';
import {
  sectionTwoFormInputValueCheck,
  sectionTwoFromFieldsCheck,
  sectionTwoInvalidInputTypeCheck,
} from '../../utils/grantAdvertUtils/section2Utils';
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
        deleteExistingGrantAdvert();
        cy.visit('/');
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

describe('Section two Award amounts - Advert builder', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    loginAndInitiliaseAdvert('section-two-award-amounts');
  });
  beforeEach(() => {
    cy.visit(sectionOverviewPageURL);
  });

  after(() => {
    cy.visit(sectionOverviewPageURL);
    deleteTestAdvert();
  });

  it('Should be able to access section two and populate the section', () => {
    //section overview - checking status and link content
    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('have.text', 'Not Started')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--grey');

    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    )
      .contains('How much funding is available?')
      .and('have.attr', 'href')
      .and('include', 'awardAmounts/1');

    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    ).click();

    cy.url().should('include', 'awardAmounts/1');
    run_accessibility();
    //this should equal to Award amounts, needs the definition changed
    cy.get('[data-cy="cy-question-page-caption-Award amounts"]').contains(
      'Award amounts'
    );
    cy.get('[data-cy="cy-advert-page-title-How much funding is available?"]')
      .contains('How much funding is available?')
      .and('have.prop', 'tagName', 'H1');

    //checking labels, hint text and input values for total amount question
    sectionTwoFromFieldsCheck({
      fieldName: 'grantTotalAwardAmount',
      headerText: 'Enter the total amount of the grant',
      hintText:
        'This is the total pot size for this grant.\nType a numerical figure, for example, £50000.',
      inputValue: '',
    });

    //checking labels, hint text and input values for  maximum amount
    sectionTwoFromFieldsCheck({
      fieldName: 'grantMaximumAward',
      headerText: 'Enter the maximum amount someone can apply for',
      hintText:
        'This is the highest amount you will award per application.\nType a numerical figure, for example, £50000.',
      inputValue: '',
    });

    //checking labels, hint text and input values for  minimum amount
    sectionTwoFromFieldsCheck({
      fieldName: 'grantMinimumAward',
      headerText: 'Enter the minimum amount someone can apply for',
      hintText:
        'This is the lowest amount you will award per application.\nType a numerical figure, for example, £50000.',
      inputValue: '',
    });

    //Validation check: mandatory
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError-summary-list"]')
      .children()
      .should('have.length', 4);

    //checking focus on error links
    run_accessibility();

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantTotalAwardAmount',
      errorMessage: 'Enter a total amount',
      oldInputValue: '',
      newInputValue: 'Non numeric answer 1',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMaximumAward',
      errorMessage: 'Enter a maximum amount',
      oldInputValue: '',
      newInputValue: 'Non numeric answer 2',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMinimumAward',
      errorMessage: 'Enter a minimum amount',
      oldInputValue: '',
      newInputValue: 'Non numeric answer 3',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'completed',
      errorMessage:
        "Select 'Yes, I've completed this question', or 'No, I'll come back later'",
      isRadioInput: true,
    });

    //Validation check: interger data type
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError-summary-list"]')
      .children()
      .should('have.length', 3);

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantTotalAwardAmount',
      errorMessage: 'You must only enter numbers',
      oldInputValue: 'Non numeric answer 1',
      newInputValue: '500000.00',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMaximumAward',
      errorMessage: 'You must only enter numbers',
      oldInputValue: 'Non numeric answer 2',
      newInputValue: '12345.67',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMinimumAward',
      errorMessage: 'You must only enter numbers',
      oldInputValue: 'Non numeric answer 3',
      newInputValue: '555.123',
    });

    //Validation check: Input cannot be a float
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError-summary-list"]')
      .children()
      .should('have.length', 3);

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantTotalAwardAmount',
      errorMessage: 'You must only enter numbers',
      oldInputValue: '500000.00',
      newInputValue: '-500000',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMaximumAward',
      errorMessage: 'You must only enter numbers',
      oldInputValue: '12345.67',
      newInputValue: '-50',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMinimumAward',
      errorMessage: 'You must only enter numbers',
      oldInputValue: '555.123',
      newInputValue: '0',
    });

    //Validation check: minimum has to be lower than maximum
    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError-summary-list"]')
      .children()
      .should('have.length', 3);

    //To change the error message to say "zero" rather than "0"
    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantTotalAwardAmount',
      errorMessage: 'Total amount must be higher than zero',
      oldInputValue: '-500000',
      newInputValue: '500000',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMaximumAward',
      errorMessage: 'Maximum amount must be higher than zero',
      oldInputValue: '-50',
      newInputValue: '50',
    });

    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMinimumAward',
      errorMessage: 'Minimum amount must be higher than zero',
      oldInputValue: '0',
      newInputValue: '100',
    });

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError-summary-list"]')
      .children()
      .should('have.length', 1);

    //Validation Check: minimum amount must be lower than maximum
    sectionTwoInvalidInputTypeCheck({
      fieldName: 'grantMinimumAward',
      errorMessage: 'The minimum amount must be less than the maximum amount',
      oldInputValue: '100',
      newInputValue: '10',
    });

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    cy.get('[data-cy="cyErrorBannerHeading"]').should('not.exist');
    cy.get('[data-cy="cyError-summary-list"]').should('not.exist');

    //back to section overview - Section 2 with completed tag
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('have.text', 'Completed')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag');

    //Back to section to check if data is retained
    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    ).click();

    cy.url().should('include', 'awardAmounts/1');

    sectionTwoFormInputValueCheck({
      fieldName: 'grantTotalAwardAmount',
      inputValue: '500000',
    });

    sectionTwoFormInputValueCheck({
      fieldName: 'grantMaximumAward',
      inputValue: '50',
    });

    sectionTwoFormInputValueCheck({
      fieldName: 'grantMinimumAward',
      inputValue: '10',
    });

    cy.get(
      `[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`
    ).should('not.be.checked');
    cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).should(
      'not.be.checked'
    );

    //Testing for "completed" question, and save and exit
    cy.get(
      `[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`
    ).check();

    cy.get('[data-cy="cy-advert-page-save-and-exit-button"]')
      .contains('Save and exit')
      .click();

    //back to sectionOver view - Section 2 with completed tag
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]').should(
      'have.text',
      'Completed'
    );

    //back to section 2 - to test save and exit button with "No, I'll come back later" option
    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    ).click();

    cy.url().should('include', 'awardAmounts/1');
    cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).check();
    cy.get('[data-cy="cy-advert-page-save-and-exit-button"]')
      .contains('Save and exit')
      .click();

    //back to sectionOver view - Section 2 with in progress tag
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('have.text', 'In Progress')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--blue');

    run_accessibility();

    //back to section 2- save and continue button with "No, I'll come back later" option
    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    ).click();

    cy.url().should('include', 'awardAmounts/1');

    cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).check();

    cy.get('[data-cy="cy-advert-page-save-and-continue-button"]')
      .contains('Save and continue')
      .click();

    //back to sectionOver view - section 2 with completed tag
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('have.text', 'In Progress')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag');

    //back to section 2- testing back navigation button and Section 2 tag should not change
    cy.get(
      '[data-cy="cy-2. Award amounts-sublist-task-name-How much funding is available?"]'
    ).click();

    cy.url().should('include', 'awardAmounts/1');

    cy.get('[data-cy="cy-advert-page-back-button"]')
      .should('have.text', 'Back')
      .and('have.attr', 'href')
      .and('includes', '/section-overview');

    cy.get('[data-cy="cy-advert-page-back-button"]').click();
    //back to section overview
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-2. Award amounts-sublist-task-status-0"]')
      .should('have.text', 'In Progress')
      .and('have.prop', 'tagName', 'STRONG')
      .and('have.class', 'govuk-tag--blue');
  });
});
