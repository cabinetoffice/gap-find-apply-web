import {
  checkLengthOfErrorsInErrorBanner,
  clickBackButton,
  enterInPageAndCheckUrlContainRightSectionAndId,
  getErrorRelatedToRadio,
} from './section5Utils';

const setInputContent = (content, fieldname) => {
  cy.wait(1000);
  cy.get(`[data-cy="cy-${fieldname}-text-input"]`)
    .should('be.visible')
    .clear()
    .type(content);
};

const checkInputContent = (content, fieldname) => {
  cy.get(`[data-cy="cy-${fieldname}-text-input"]`).should(
    'have.value',
    content
  );
};

const enterInPageAddValueAndPressBackAndReEnterAndCheckInputIsEmpty = (
  pageTitle,
  sectionName,
  pageId,
  textToAdd,
  fieldName
) => {
  enterInPageAndCheckUrlContainRightSectionAndId(
    pageTitle,
    sectionName,
    pageId
  );
  setInputContent(textToAdd, fieldName);
  clickBackButton();
  enterInPageAndCheckUrlContainRightSectionAndId(
    pageTitle,
    sectionName,
    pageId
  );
  checkInputContent('', fieldName);
  clickBackButton();
};

const checkErrorBannerErrorsAndRespectiveLinks = (
  expectedNumberOfErrors,
  fieldName,
  questionError,
  radioError
) => {
  checkLengthOfErrorsInErrorBanner(expectedNumberOfErrors);

  getErrorRelatedToInput(fieldName, questionError);

  getErrorRelatedToRadio(radioError);
};

const getErrorRelatedToInput = (fieldName, questionError) => {
  cy.get(`[data-cy="cyError_${fieldName}"]`).contains(questionError).click();
  cy.focused().should('have.attr', 'name').and('eq', fieldName);
};

export {
  setInputContent,
  checkInputContent,
  enterInPageAddValueAndPressBackAndReEnterAndCheckInputIsEmpty,
  checkErrorBannerErrorsAndRespectiveLinks,
};
