export default function addQuestionToSection(sectionName, questionNo) {
  cy.get(`[data-cy="cy_addAQuestion-${sectionName}"]`)
    .contains('Add a question')
    .click({ force: true });
  cy.get('input[name="fieldTitle"]').should('have.value', '');
  cy.get('textarea[name="hintText"').should('have.value', '');
  cy.get('input[name="fieldTitle"]').type(`QA Question ${questionNo} Title`);
  cy.get('textarea[name="hintText"]').type(
    `QA Question ${questionNo} Hint text for testing question types.`
  );
  cy.get(`[data-cy="cy-radioInput-option-Yes"]`).click();
  cy.get('button').contains('Save and continue').click();
}
