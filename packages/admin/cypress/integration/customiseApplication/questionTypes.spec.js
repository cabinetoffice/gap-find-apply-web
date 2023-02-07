import addQuestionToSection from '../../utils/addQuestionToSection';
import createTestApplication from '../../utils/createTestApplication';
import {
  deleteExistingTestApplication,
  extractApplicationIdFromURL,
} from '../../utils/deleteApplications';
import questionTypePreviewCommonChecks from '../../utils/questionTypePreviewCommonChecks';
import run_accessibility from '../../utils/run_accessibility';

describe('Test each question type', () => {
  let questionNo = 0;
  const applicationName = 'A testing application';
  const sectionName = 'Custom section';
  let applicationId;
  before(() => {
    cy.session('Test each question type', () => {
      cy.visit('/');
    });
    cy.visit('/');

    deleteExistingTestApplication();
    createTestApplication(applicationName);
    cy.get('[data-cy="cy-button-addNewSection"]')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', 'section-name');
    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('input').eq(0).type(sectionName);

    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().then((url) => {
      applicationId = extractApplicationIdFromURL(url);
    });
  });

  after(() => {
    deleteExistingTestApplication();
  });

  beforeEach(() => {
    // add new question to custom section
    // complete initial question-content page
    cy.visit(`/build-application/${applicationId}/dashboard`);
    addQuestionToSection(sectionName, questionNo);
  });

  it('Should allow an admin to create a short answer question type and edit it afterwards', () => {
    cy.get('input[data-cy="cy-radioInput-option-ShortAnswer"]').check();
    cy.get('details[data-cy="cy-details-short-answer"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-short-answer"]').click();
    cy.get('details[data-cy="cy-details-short-answer"]').should(
      'have.attr',
      'open'
    );

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();
    //checking if question is added

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Short answer`);

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);
    cy.get('[data-cy="cy-preview-text-input"]').should('have.value', '');

    //edit question title
    cy.get('[data-cy="cy_questionPreview-changeQuestionButton"]')
      .contains('Change')
      .click();

    cy.url().should('include', 'edit/question-content');
    cy.get('[data-cy="cy-fieldTitle-question-title"]').contains(
      'Enter a question'
    );

    cy.get(`[data-cy="cy-question-page-caption-${sectionName}"`).contains(
      sectionName
    );

    //asserting data inputs to be filled in
    cy.get('[data-cy="cy-fieldTitle-text-input"]').should(
      'have.value',
      `QA Question ${questionNo} Title`
    );
    cy.get('textarea[name="hintText"]').should(
      'have.value',
      `QA Question ${questionNo} Hint text for testing question types.`
    );
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    run_accessibility();

    //cancel changes check
    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    cy.get('[data-cy="cy-fieldTitle-text-input"]').clear();
    cy.get('textarea[name="hintText"]').clear();

    cy.get('[data-cy="cy_questionEdit_cancelChangesButton"]')
      .contains('Cancel')
      .click();

    //back to question preview
    cy.get('[data-cy="cy-preview-question-title"]').contains(
      `QA Question ${questionNo} Title`
    );
    cy.get('[data-cy="cy-preview-question-hint"]').contains(
      `QA Question ${questionNo} Hint text for testing question types.`
    );

    //Validation checks
    cy.get('[data-cy="cy_questionPreview-changeQuestionButton"]').click();
    cy.url().should('include', 'edit/question-content');

    //empty title valdiation
    cy.get('[data-cy="cy-fieldTitle-text-input"]').clear();
    cy.get('[data-cy="cy-button-Save and continue"]')
      .contains('Save and continue')
      .click();

    //run accessibility with errors on page
    run_accessibility();

    //check blank validation messages (name and mandatory)
    cy.get('[data-cy="cyError_fieldTitle"]')
      .contains('Question title can not be less than 2 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'fieldTitle');

    //check question title with 255+ characters
    cy.get('[data-cy="cy-fieldTitle-text-input"]')
      .should('have.value', '')
      .click()
      .type('a'.repeat(256), { delay: 0 });
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_fieldTitle"]')
      .contains('Question title can not be greater than 255 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'fieldTitle');

    //valid data for title
    cy.get('[data-cy="cy-fieldTitle-text-input"]')
      .clear()
      .type(`QA Question ${questionNo} Title edited`);
    //check description with 1000+ characters

    cy.get('textarea[name="hintText"]')
      .should(
        'have.value',
        `QA Question ${questionNo} Hint text for testing question types.`
      )
      .click()
      .type('a'.repeat(1001), { delay: 0 });
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_hintText"]')
      .contains('Question hint can not be greater than 1000 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'hintText');
    run_accessibility();
    //submit with valid test data
    cy.get('textarea').click().clear().type('a '.repeat(500), { delay: 0 });

    //making question optional
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //back to dashboard
    cy.url().should('include', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_Section-QA Question ${questionNo} Title edited"]`
    ).click();
    //check data changed in question preview
    cy.get('[data-cy="cy-preview-question-title"]').contains(
      `QA Question ${questionNo} Title edited (optional)`
    );
    cy.get('[data-cy="cy-preview-question-hint"]').contains('a '.repeat(500));

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Short answer`);

    questionNo++;
  });

  it('Should allow an admin to create a long answer question type.', () => {
    cy.get('input[data-cy="cy-radioInput-option-LongAnswer"]').check();
    cy.get('details[data-cy="cy-details-long-answer"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-long-answer"]').click();
    cy.get('details[data-cy="cy-details-long-answer"]').should(
      'have.attr',
      'open'
    );

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Long answer`);

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    cy.get('textarea').should('have.value', '');

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Long answer`);

    questionNo++;
  });

  it('Should allow an admin to create a yes/no question type.', () => {
    cy.get('input[data-cy="cy-radioInput-option-YesNo"]').check();
    cy.get('details[data-cy="cy-details-yes-no"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-yes-no"]').click();
    cy.get('details[data-cy="cy-details-yes-no"]').should('have.attr', 'open');

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Yes/No`);

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    //only checking if the element exists
    cy.get('[data-cy="cy-radioInput-option-Yes"]')
      .should('exist')
      .and('not.be.checked');

    cy.get('[data-cy="cy-radioInput-option-No"]')
      .should('exist')
      .and('not.be.checked');

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Yes/No`);
    questionNo++;
  });

  it('Should allow an admin to create a document upload question type.', () => {
    cy.get('input[data-cy="cy-radioInput-option-DocumentUpload"]').check();
    cy.get('details[data-cy="cy-details-document-upload"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-document-upload"]').click();
    cy.get('details[data-cy="cy-details-document-upload"]').should(
      'have.attr',
      'open'
    );

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Document upload`);

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    //only checking if the element exists
    cy.get('input[name="preview"]').should('exist');

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Document upload`);
    questionNo++;
  });

  it('Should allow an admin to create a date question type.', () => {
    cy.get('input[data-cy="cy-radioInput-option-Date"]').check();
    cy.get('details[data-cy="cy-details-date"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-date"]').click();
    cy.get('details[data-cy="cy-details-date"]').should('have.attr', 'open');

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Date`);

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    //only checking if the element exists
    cy.get('[data-cy="cyDateFilter-previewDay"]').should('exist');

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Date`);
    questionNo++;
  });

  it('Should allow an admin to delete a question.', () => {
    cy.get('input[data-cy="cy-radioInput-option-Date"]').check();
    cy.get('details[data-cy="cy-details-date"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-date"]').click();
    cy.get('details[data-cy="cy-details-date"]').should('have.attr', 'open');

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get('h1').contains('Build an application form');

    //click on delete button
    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    )
      .contains('Delete')
      .click();

    //accessiblity test on delete confrimation page
    cy.url().should('include', 'delete-confirmation');
    cy.get('h1').should('have.text', 'Do you want to delete this question?');
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    run_accessibility();

    //cancel should take you to dashboard
    cy.get('[data-cy="cy_deleteQuestion-cancelLink"]')
      .contains('Cancel')
      .click();

    //back to dashboard
    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    )
      .should('exist')
      .contains(`QA Question ${questionNo} Title`);

    //clicking confirm when no is slected
    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).click();
    cy.url().should('include', 'delete-confirmation');
    cy.get('h1').should('have.text', 'Do you want to delete this question?');
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    cy.get('[data-cy="cy-button-Confirm"]').contains('Confirm').click();

    //back to dashboard
    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    )
      .should('exist')
      .contains(`QA Question ${questionNo} Title`);

    //clicking confirm when yes is selected
    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).click();
    cy.url().should('include', 'delete-confirmation');
    cy.get('h1').should('have.text', 'Do you want to delete this question?');
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    cy.get('[data-cy="cy-button-Confirm"]').contains('Confirm').click();

    //back to dashboard, check question has been dleted
    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cyApplicationTitle"]').contains(applicationName);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).should('not.exist');

    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).should('not.exist');
  });

  it('Should allow an admin to create a multiple-choice question type', () => {
    cy.get('input[data-cy="cy-radioInput-option-MultipleChoice"]').check();
    cy.get('details[data-cy="cy-details-dropdown"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-dropdown"]').click();
    cy.get('details[data-cy="cy-details-dropdown"]').should(
      'have.attr',
      'open'
    );

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //custom options page
    cy.url().should('contain', '/question-options');

    cy.get('[data-cy="cy_questionOptionsPage-header"]').contains(
      `QA Question ${questionNo} Title`
    );

    cy.get('[data-cy="cy_optionQuestionsPageSummary"]').should(
      'have.text',
      'You must enter at least two options. Applicants will only be able to choose one answer.'
    );

    cy.get('[data-cy="cy_questionOptionsPage-hintText"]').should(
      'have.text',
      `QA Question ${questionNo} Hint text for testing question types.`
    );

    cy.get(`[data-cy="cy-question-page-caption-${sectionName}"]`).contains(
      'Custom section'
    );
    run_accessibility();

    //go back to check if question type is retained
    cy.get('[data-cy="cy_questionOptionsPage-backButton"]').click();
    cy.url().should('include', 'question-type');
    cy.get('input[data-cy="cy-radioInput-option-MultipleChoice"]').should(
      'be.checked'
    );
    //back to options page
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('contain', '/question-options');

    //submitting with only one option
    cy.get('[data-cy="cy-button-Save question"]')
      .should('contain', 'Save question')
      .click();

    //must have two options and not blank, validation error
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');

    cy.get('[data-cy="cyError_options[0]"]').should('have.length', 2);
    cy.get('[data-cy="cyError_options[0]"]').each((element) => {
      expect(element[0].text).to.be.oneOf([
        'Enter an option',
        'You must have a minimum of two options',
      ]);
    });
    run_accessibility();

    //must have two options only
    cy.get('input[data-cy="cy-options[0]-text-input"]').type('Valid data');
    cy.get('[data-cy="cy-button-Save question"]').click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_options[0]"]')
      .should('have.length', 1)
      .and('contain', 'You must have a minimum of two options');

    //add in another question with more than 255 chars
    cy.get('[data-cy="cy-button-Add another option"]')
      .contains('Add another option')
      .click();

    cy.get('[data-cy="cy-options[1]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the second option');

    cy.get('input[data-cy="cy-options[1]-text-input"]').type('a'.repeat(256), {
      delay: 0,
    });

    //check retention
    cy.get('input[data-cy="cy-options[0]-text-input"]').should(
      'have.value',
      'Valid data'
    );
    //submit
    cy.get('[data-cy="cy-button-Save question"]').click();

    //validation for more than 255 chars
    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_options[1]"]')
      .should('have.length', 1)
      .and('contain', 'Option cannot be greater than 255 characters');

    //should have two must not be blank errors and no must have two options
    cy.get('input[data-cy="cy-options[1]-text-input"]')
      .clear()
      .type('Valid data 2');
    cy.get('[data-cy="cy-button-Add another option"]').click();
    cy.get('[data-cy="cyErrorBannerHeading"]').should('not.exist');

    //check for empty validation for more than 2 questions
    cy.get('[data-cy="cy-options[2]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the third option');
    cy.get('[data-cy="cy-button-Save question"]').click();

    cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
    cy.get('[data-cy="cyError_options[2]"]')
      .should('have.length', 1)
      .and('contain', 'Enter an option')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'options[2]');
    cy.get('input[data-cy="cy-options[2]-text-input"]').type('Valid data 3');

    cy.get('[data-cy="cy-button-Save question"]').click();

    //check question is rendered in the dashboard
    cy.url().should('include', 'dashboard');
    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Multiple choice`);
    cy.get('h1').contains('Build an application form');

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    cy.get('select').children().should('have.length', 3);

    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Multiple choice`);
    questionNo++;
  });

  it('Should allow an admin to create a multiple-select question type and edit it', () => {
    cy.get('input[data-cy="cy-radioInput-option-MultipleSelect"]').check();
    cy.get('details[data-cy="cy-details-multiple-selection"]').should(
      'not.have.attr',
      'open'
    );
    cy.get('summary[data-cy="cy-details-link-multiple-selection"]').click();
    cy.get('details[data-cy="cy-details-multiple-selection"]').should(
      'have.attr',
      'open'
    );

    run_accessibility();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //custom options page
    cy.url().should('contain', '/question-options');

    cy.get('[data-cy="cy_questionOptionsPage-header"]').contains(
      `QA Question ${questionNo} Title`
    );

    cy.get('[data-cy="cy_optionQuestionsPageSummary"]').should(
      'have.text',
      'You must enter at least two options. Applicants will be able to choose one or more answers.'
    );

    cy.get('[data-cy="cy_questionOptionsPage-hintText"]').should(
      'have.text',
      `QA Question ${questionNo} Hint text for testing question types.`
    );

    cy.get(`[data-cy="cy-question-page-caption-${sectionName}"]`).contains(
      'Custom section'
    );
    run_accessibility();

    //go back to check if question type is retained
    cy.get('[data-cy="cy_questionOptionsPage-backButton"]').click();
    cy.url().should('include', 'question-type');
    cy.get('input[data-cy="cy-radioInput-option-MultipleSelect"]').should(
      'be.checked'
    );
    //back to options page
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('contain', '/question-options');

    //add multiple options
    cy.get('[data-cy="cy-button-Add another option"]')
      .contains('Add another option')
      .click();

    cy.get('[data-cy="cy-options[1]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the second option');

    cy.get('[data-cy="cy-button-Add another option"]')
      .contains('Add another option')
      .click();

    cy.get('[data-cy="cy-options[2]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the third option');

    cy.get('[data-cy="cy-button-Add another option"]')
      .contains('Add another option')
      .click();

    cy.get('[data-cy="cy-options[3]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the fourth option');

    //check that all are empty and fill in data
    cy.get('input[data-cy="cy-options[0]-text-input"]')
      .should('have.value', '')
      .type('Valid data 1');
    cy.get('input[data-cy="cy-options[1]-text-input"]')
      .should('have.value', '')
      .type('Valid data 2');
    cy.get('input[data-cy="cy-options[2]-text-input"]')
      .should('have.value', '')
      .type('Valid data 3');
    cy.get('input[data-cy="cy-options[3]-text-input"]')
      .should('have.value', '')
      .type('Valid data 4');

    //submit question
    cy.get('[data-cy="cy-button-Save question"]').click();

    //check question is rendered in the dashboard
    cy.url().should('include', 'dashboard');
    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Multiple select`);

    cy.get('h1').contains('Build an application form');

    //viewing question

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    questionTypePreviewCommonChecks(questionNo);

    cy.get('[type="checkbox"]').should('have.length', 4);

    //editing the question
    cy.get('[data-cy="cy_questionPreview-changeQuestionButton"]')
      .contains('Change')
      .click();

    cy.url().should('include', 'edit/question-content');
    cy.get('[data-cy="cy-fieldTitle-question-title"]').contains(
      'Enter a question'
    );
    cy.get(`[data-cy="cy-question-page-caption-${sectionName}"`).contains(
      sectionName
    );

    //asserting data inputs to be filled in
    cy.get('[data-cy="cy-fieldTitle-text-input"]').should(
      'have.value',
      `QA Question ${questionNo} Title`
    );
    cy.get('textarea[name="hintText"]').should(
      'have.value',
      `QA Question ${questionNo} Hint text for testing question types.`
    );
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    run_accessibility();

    //edit question details
    cy.get('[data-cy="cy-fieldTitle-text-input"]')
      .clear()
      .type(`QA Question ${questionNo} Title edited`);

    cy.get('textarea[name="hintText"]')
      .should(
        'have.value',
        `QA Question ${questionNo} Hint text for testing question types.`
      )
      .clear()
      .type('a '.repeat(500), { delay: 0 });

    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //editing options

    cy.url().should('include', 'edit/question-options');

    run_accessibility();

    //delete an option then hit cancel
    cy.get('[data-cy="cy-options[0]-text-input"]').should(
      'have.value',
      'Valid data 1'
    );
    cy.get(`[data-cy="cy_questionOptions-deleteOption-1"]`)
      .contains('Delete')
      .click();

    cy.get('[data-cy="cy-options[0]-text-input"]').should(
      'have.value',
      'Valid data 2'
    );

    //cancel changes
    cy.get('[data-cy="cy_questionOptions-cancelLink"]')
      .contains('Cancel')
      .click();

    //back in question preview
    cy.url().should('include', 'preview');

    cy.get('[type="checkbox"]').should('have.length', 4);
    //question content to be changed
    //check data changed in question preview
    cy.get('[data-cy="cy-preview-question-title"]').contains(
      `QA Question ${questionNo} Title edited (optional)`
    );
    cy.get('[data-cy="cy-preview-question-hint"]').contains('a '.repeat(500));

    //navigating back to options page
    cy.get('[data-cy="cy_questionPreview-changeQuestionButton"]').click();
    cy.url().should('include', 'edit/question-content');

    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().should('include', 'edit/question-options');

    //validating empty option
    cy.get('[data-cy="cy-options[3]-text-input"]')
      .should('have.value', 'Valid data 4')
      .clear();

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_options[3]"]')
      .contains('Enter an option')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'options[3]');

    //255 max char validation
    cy.get('[data-cy="cy-options[3]-text-input"]').type('a'.repeat(256), {
      delay: 0,
    });

    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.get('[data-cy="cyError_options[3]"]')
      .contains('Option cannot be greater than 255 characters')
      .click();

    cy.focused().should('have.attr', 'name').and('eq', 'options[3]');

    //Deleting options
    cy.get(`[data-cy="cy_questionOptions-deleteOption-4"]`).click();
    cy.get(`[data-cy="cy_questionOptions-deleteOption-3"]`).click();

    cy.get(`[data-cy="cy_questionOptions-deleteOption-2"]`).should('not.exist');
    cy.get(`[data-cy="cy_questionOptions-deleteOption-1"]`).should('not.exist');

    cy.get('[data-cy="cy-button-Add another option"]').click();

    //adding option
    cy.get('[data-cy="cy-options[2]-question-title"]')
      .should('exist')
      .and('contain', 'Enter the third option');

    cy.get('input[data-cy="cy-options[2]-text-input"]').type('ab '.repeat(85), {
      delay: 0,
    });

    //saving changes
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    //back to application dashboard
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_Section-QA Question ${questionNo} Title edited"]`
    ).click();

    //in preview question page
    cy.url().should('include', 'preview');
    cy.get('[type="checkbox"]').should('have.length', 3);

    cy.get('input[id="preview-3"]')
      .should('exist')
      .and('have.value', 'ab '.repeat(85));
    //return to application form
    cy.get('[data-cy="cy_questionPreview-returnToApplicationFormButton"]')
      .contains('Return to application form')
      .click();

    //check we're back in dashboard and question is still there
    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-0"]`
    ).contains(`QA Question ${questionNo} Title`);

    cy.get(
      `[data-cy="cy_table_row-for-3. ${sectionName}-row-${questionNo}-cell-1"]`
    ).contains(`Multiple select`);
    questionNo++;
  });
});
