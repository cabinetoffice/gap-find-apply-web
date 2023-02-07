import run_accessibility from './accessibility';

export default function checkQuestionTitlesAndURL(
  sectionTitle,
  fieldName,
  questionTitle,
  questionHint
) {
  cy.url().should('include', sectionTitle).and('include', fieldName);
  run_accessibility();

  if (fieldName === 'ELIGIBILITY') {
    cy.get(`[data-cy=cy-${fieldName}-question-title-page]`).should(
      'have.text',
      questionTitle
    );
  } else {
    cy.get(`[data-cy=cy-${fieldName}-question-title]`).should(
      'have.text',
      questionTitle
    );
  }

  if (questionHint) {
    cy.get(`[data-cy="cy-${fieldName}-question-hint"]`).should(
      'have.text',
      questionHint
    );
  }
}
