const setDatesContent = (fieldName, day, month, year) => {
  cy.get(`[data-cy=cyDateFilter-${fieldName}Day]`).clear();
  day !== '' &&
    cy.get(`[data-cy=cyDateFilter-${fieldName}Day]`).clear().type(day);
  cy.get(`[data-cy=cyDateFilter-${fieldName}Month]`).clear();
  month !== '' &&
    cy.get(`[data-cy=cyDateFilter-${fieldName}Month]`).clear().type(month);
  cy.get(`[data-cy=cyDateFilter-${fieldName}Year]`).clear();
  year !== '' &&
    cy.get(`[data-cy=cyDateFilter-${fieldName}Year]`).clear().type(year);
};

const checkDatesContent = (fieldName, day, month, year) => {
  cy.get(`[data-cy=cyDateFilter-${fieldName}Day]`).should('have.value', day);
  cy.get(`[data-cy=cyDateFilter-${fieldName}Month]`).should(
    'have.value',
    month
  );
  cy.get(`[data-cy=cyDateFilter-${fieldName}Year]`).should('have.value', year);
};

const getDateError = (fieldName, dateType, error) => {
  cy.get(`[data-cy=cyError_${fieldName}-${dateType}]`).contains(error).click();
  cy.focused()
    .should('have.attr', 'name')
    .and('eq', `${fieldName}-${dateType}`);
};

export { setDatesContent, checkDatesContent, getDateError };
