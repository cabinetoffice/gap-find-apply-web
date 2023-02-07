// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add('setTinyMceContent', (content, fieldName) => {
  cy.window().should('have.property', 'tinymce');
  cy.window().then((win) => {
    cy.wait(1000).then(() => {
      const editor = win.tinymce.EditorManager.get().filter(
        (editor) => editor.id === fieldName
      )[0];
      cy.wrap(editor.setContent(content));
    });
  });
  cy.wait(2000);
});
