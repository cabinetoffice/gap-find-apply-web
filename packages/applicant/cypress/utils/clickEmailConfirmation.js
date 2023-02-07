export default function clickEmailConfirmation() {
  cy.get('p')
    .contains('a')
    .invoke('attr', 'href')
    .then((href) => {
      cy.visit(href);
    });
}
