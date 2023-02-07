const addAdvertToScheme = (advertName) => {
  cy.visit('/scheme/3');

  cy.get('[data-cy="cyBuildAdvert"]').click();
  cy.get('[data-cy="cy-name-text-input"]').clear().type(`${advertName}`);
  cy.get('[data-cy="cy-button-Save and continue"]').click();
};

export default addAdvertToScheme;
