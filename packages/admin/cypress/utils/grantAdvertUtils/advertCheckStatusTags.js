import run_accessibility from '../run_accessibility';

export default function advertCheckSectionStatus(
  sectionId,
  sectionTitle,
  pageTitle,
  pageIndex,
  inputComponent,
  value,
  checkbox
) {
  // click "No, I'll come back later" and test that the section status is in progress
  cy.get('[ data-cy="cy-radioInput-option-NoIllComeBackLater"]').click();
  cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').click();
  cy.url().should('include', '/section-overview');

  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-status-${pageIndex}"]`
  )
    .should('have.text', 'In Progress')
    .and('have.prop', 'tagName', 'STRONG')
    .and('have.class', 'govuk-tag--blue');

  // click back into the section, verify the field value and click "Yes I have completed this question"
  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-name-${pageTitle}"]`
  ).click();
  cy.get(
    '[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]'
  ).click();

  if (checkbox === true) {
    cy.get(`[data-cy="${inputComponent}"]`).should(
      value ? 'be.checked' : 'not.be.checked'
    );
  } else {
    cy.get(`[data-cy="${inputComponent}"]`).should('have.value', value);
  }

  cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').click();
  cy.url().should('include', '/section-overview');

  // verify that the section status is now completed
  cy.get(
    `[data-cy="cy-${sectionId}. ${sectionTitle}-sublist-task-status-${pageIndex}"]`
  )
    .should('have.text', 'Completed')
    .and('have.prop', 'tagName', 'STRONG')
    .and('have.class', 'govuk-tag');
  run_accessibility();
}
