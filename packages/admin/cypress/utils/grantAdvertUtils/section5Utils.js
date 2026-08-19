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

// The rich text mark-up is corrected at runtime to clear the failures raised in
// the DAC audit (DAC_Inaccessible_Content_01, DAC_Custom_Select_01,
// DAC_Custom_Text_Area_01). Unit tests cover that against a fixture, so these
// assertions exist to catch a TinyMCE upgrade rendering something the fixture
// no longer represents.
const checkRichTextAccessibility = (fieldName) => {
  cy.get('.tox-tinymce').should('not.have.attr', 'role', 'application');

  cy.get('.tox-editor-header [role="toolbar"]').should(
    'have.attr',
    'aria-label',
    'Formatting'
  );

  cy.get('.tox-tbtn[tabindex="0"]').should('have.length', 1);

  cy.get('.tox-tbtn').each(($button) => {
    expect($button.prop('tagName')).to.eq('BUTTON');
  });

  // Inline mode: the editing area is an element in the page, not an iframe.
  cy.get('.gap-rich-text iframe').should('not.exist');

  cy.get(`#${fieldName}`)
    .should('have.class', 'mce-content-body')
    .and('have.attr', 'contenteditable', 'true')
    .and('have.attr', 'role', 'textbox')
    .and('have.attr', 'aria-multiline', 'true')
    .and('have.attr', 'aria-labelledby', `${fieldName}-label`)
    .and('have.attr', 'aria-describedby', `${fieldName}-hint`);

  cy.get(`#${fieldName}-label`).should('be.visible').and('not.be.empty');
  cy.get(`#${fieldName}-hint`).should('exist');

  checkLinkDialogAccessibility();
};

// Opening the dialog is the only way to check TinyMCE's real mark-up rather
// than the fixture the unit tests assert against. Closing it with its own
// Close button doubles as a check that the button still works once its
// tabindex has been removed (DAC_Not_Keyboard_Navigable_01).
const checkLinkDialogAccessibility = () => {
  cy.get('.tox-tbtn[aria-label="Insert/edit link"]').click();

  cy.get('.tox-dialog').should('be.visible');
  cy.get('.tox-dialog__header button')
    .should('have.attr', 'aria-label', 'Close')
    .and('not.have.attr', 'tabindex');

  // Only the URL field's own mark-up is asserted here. Whether its suggestion
  // popup is reshaped into a listbox of options (DAC_Custom_Combobox_01)
  // depends on suggestions being offered, so that is covered by the unit tests
  // and by the manual screen reader pass instead.
  cy.get('.tox-dialog [role="combobox"]').should(
    'have.attr',
    'aria-haspopup',
    'listbox'
  );

  cy.get('.tox-dialog__header button').click();
  cy.get('.tox-dialog').should('not.exist');
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
  checkRichTextAccessibility,
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
