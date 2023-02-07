const sectionTwoFromFieldsCheck = ({
  fieldName,
  headerText,
  hintText,
  inputValue,
}) => {
  cy.get(`[data-cy="cy-${fieldName}-question-title"]`)
    .should('have.prop', 'tagName', 'H2')
    .and('have.text', headerText);

  cy.get(`[data-cy="cy-${fieldName}-question-hint"]`).should(
    'have.text',
    hintText
  );

  cy.get(`[data-cy="cy-${fieldName}-text-input-prefix"]`).contains('£');
  sectionTwoFormInputValueCheck({
    fieldName: fieldName,
    inputValue: inputValue,
  });
};

const sectionTwoFormInputValueCheck = ({ fieldName, inputValue }) => {
  cy.get(`[data-cy="cy-${fieldName}-text-input-numeric"]`).should(
    'have.value',
    inputValue
  );
};

const sectionTwoInvalidInputTypeCheck = ({
  fieldName,
  errorMessage,
  oldInputValue,
  newInputValue,
  isRadioInput = false,
}) => {
  cy.get(`[data-cy="cyError_${fieldName}"]`).contains(errorMessage).click();

  cy.focused().should('have.attr', 'name').and('eq', fieldName);

  if (isRadioInput) {
    cy.get(
      `[data-cy="cy-radioInput-option-YesIveCompletedThisQuestion"]`
    ).check();
  } else {
    sectionTwoFormInputValueCheck({
      fieldName: fieldName,
      inputValue: oldInputValue,
    });
    cy.get(`[data-cy="cy-${fieldName}-text-input-numeric"]`)
      .clear()
      .type(newInputValue);
  }
};
export {
  sectionTwoFromFieldsCheck,
  sectionTwoFormInputValueCheck,
  sectionTwoInvalidInputTypeCheck,
};
