import run_accessibility from '../run_accessibility';

const checkPageStatus = (sectionId, sectionTitle, status, pageIndex) => {
  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-status-${pageIndex}"]`
  )
    .should('have.text', status)
    .and('have.prop', 'tagName', 'STRONG')
    .and(
      'have.class',
      `${
        status === 'Not Started'
          ? 'govuk-tag--grey'
          : status === 'Completed'
          ? 'govuk-tag'
          : 'govuk-tag--blue'
      }`
    );
};

const enterInPageAndCheckUrlContainRightSectionAndId = (
  pageTitle,
  sectionTitle,
  sectionName,
  sectionId,
  pageId
) => {
  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-name-${pageTitle}"]`
  )
    .contains(pageTitle)
    .and('have.attr', 'href')
    .and('include', `${sectionName}/${pageId}`);

  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-name-${pageTitle}"]`
  ).click();

  cy.url().should('include', `${sectionName}/${pageId}`);
};

const selectRadioButtonNo = () => {
  cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).check();
};

const selectRadioButtonYes = () => {
  cy.get(
    `[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`
  ).check();
};
const clickBackButton = () => {
  cy.get(`[data-cy="cy-advert-page-back-button"]`).click();
};
const enterInPageAddValueAndPressBackAndReEnterAndCheckTinyMceIsEmpty = (
  pageTitle,
  sectionTitle,
  sectionName,
  sectionId,
  pageId,
  textToAdd,
  fieldName
) => {
  enterInPageAndCheckUrlContainRightSectionAndId(
    pageTitle,
    sectionTitle,
    sectionName,
    sectionId,
    pageId
  );
  cy.setTinyMceContent(textToAdd, fieldName);
  clickBackButton();
  enterInPageAndCheckUrlContainRightSectionAndId(
    pageTitle,
    sectionTitle,
    sectionName,
    sectionId,
    pageId
  );
  checkContentOfTinyMce('');
  clickBackButton();
};

const checkFirstAccessToThePage = (
  pageTitle,
  sectionName,
  sectionTitle,
  sectionId,
  fieldName,
  questionTitle,
  questionHintText,
  pageStatus,
  pageId,
  pageIndex
) => {
  cy.get('[data-cy="cy-summary-overview-header"]').should(
    'have.text',
    'Create an advert'
  );

  checkPageStatus(sectionId, sectionTitle, pageStatus, pageIndex);

  enterInPageAndCheckUrlContainRightSectionAndId(
    pageTitle,
    sectionTitle,
    sectionName,
    sectionId,
    pageId
  );
  run_accessibility();

  cy.get(`[data-cy="cy-question-page-caption-${sectionTitle}"]`).contains(
    sectionTitle
  );

  cy.get(`[data-cy="cy-${fieldName}-question-title"]`)
    .should('have.prop', 'tagName', 'H1')
    .and('have.text', questionTitle);

  cy.get(`[data-cy="cy-${fieldName}-question-hint"]`).and(
    'have.text',
    questionHintText
  );

  cy.get(`[data-cy="cy-completed-question-title"]`)
    .should('have.prop', 'tagName', 'H2')
    .and('have.text', 'Have you completed this question?');

  cy.get(`[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`).should(
    'not.be.checked'
  );
  cy.get(`[data-cy="cy-radioInput-option-NoIllComeBackLater"]`).should(
    'not.be.checked'
  );
  cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').contains(
    'Save and continue'
  );
  cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').contains(
    'Save and exit'
  );
};

const clickSaveAndContinue = () => {
  cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
};

const clickSaveAndExit = () => {
  cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').click();
};

const checkLengthOfErrorsInErrorBanner = (expectedNumberOfErrors) => {
  cy.get('[data-cy="cyErrorBannerHeading"]').contains('There is a problem');
  cy.get('[data-cy="cyError-summary-list"]')
    .children()
    .should('have.length', expectedNumberOfErrors);
};

const checkErrorBannerErrorsAndRespectiveLinks = (
  expectedNumberOfErrors,
  fieldName,
  questionError,
  radioError
) => {
  checkLengthOfErrorsInErrorBanner(expectedNumberOfErrors);

  getErrorRelatedToTinyMce(fieldName, questionError);

  getErrorRelatedToRadio(radioError);
};

const getErrorRelatedToTinyMce = (fieldName, questionError) => {
  cy.get(`[data-cy="cyError_${fieldName}"]`).contains(questionError).click();
};

const getErrorRelatedToRadio = (radioError) => {
  cy.get(`[data-cy="cyError_completed"]`).contains(radioError).click();
  cy.focused().should('have.attr', 'name').and('eq', 'completed');
};

const checkContentOfTinyMce = (textToCompareTo) => {
  cy.window().then((win) => {
    cy.wait(2000).then(() => {
      cy.wrap(win.tinymce.activeEditor.getContent({ format: 'text' })).should(
        'eq',
        textToCompareTo
      );
    });
  });
};

export {
  checkFirstAccessToThePage,
  getErrorRelatedToTinyMce,
  getErrorRelatedToRadio,
  clickSaveAndContinue,
  clickSaveAndExit,
  checkContentOfTinyMce,
  enterInPageAndCheckUrlContainRightSectionAndId,
  checkErrorBannerErrorsAndRespectiveLinks,
  clickBackButton,
  checkLengthOfErrorsInErrorBanner,
  selectRadioButtonNo,
  selectRadioButtonYes,
  checkPageStatus,
  enterInPageAddValueAndPressBackAndReEnterAndCheckTinyMceIsEmpty,
};
