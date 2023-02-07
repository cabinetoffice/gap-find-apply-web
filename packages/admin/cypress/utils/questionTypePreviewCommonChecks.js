export default function questionTypePreviewCommonChecks(
  questionNo,
  publishedState = true
) {
  cy.url().should('include', 'preview');
  cy.get('[data-cy="cy_questionPreviewPage-captionText"]').contains(
    'How this will look to the applicant'
  );

  cy.get('[data-cy="cy-preview-question-title"]').contains(
    `QA Question ${questionNo} Title`
  );

  cy.get('[data-cy="cy-preview-question-hint"]').contains(
    `QA Question ${questionNo} Hint text for testing question types.`
  );

  cy.get('[data-cy="cy_questionPreviewPage-SaveandContinueButton"]').should(
    'not.have.attr',
    'href'
  );
  cy.get('[data-cy="cy_questionPreviewPage-SaveandContinueButton"]').contains(
    'Save and continue'
  );
  cy.get('[data-cy="cy_questionPreviewPage-disabledSaveandExitButton"]').should(
    'not.have.attr',
    'href'
  );
  cy.get(
    '[data-cy="cy_questionPreviewPage-disabledSaveandExitButton"]'
  ).contains('Save and exit');

  publishedState
    ? cy
        .get('[data-cy="cy_questionPreview-h2ToChangeQuestionText"]')
        .contains('Would you like to change this question?')
    : cy
        .get('[data-cy="cy_questionPreview-h2ToChangeQuestionText"]')
        .should('not.exist');
}
