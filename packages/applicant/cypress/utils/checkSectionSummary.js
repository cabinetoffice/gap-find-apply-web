export default function checkErrorBanner(questionId, question, questionValue) {
  cy.get(`[data-cy="cy-section-details-${questionId}"]`).should(
    'have.text',
    question
  );
  cy.get(`[data-cy="cy-section-value-${questionValue}"]`).should(
    'have.text',
    questionValue
  );
  cy.get(`[data-cy="cy-section-details-navigation-${questionId}"]`).should(
    'have.text',
    `Change${questionId}`
  );
}
