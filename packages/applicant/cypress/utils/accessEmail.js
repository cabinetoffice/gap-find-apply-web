import { recurse } from 'cypress-recurse';

export default function accessEmail(keepEmails) {
  //fetch the email
  recurse(
    () => cy.task('getLastEmail', { keepEmails: keepEmails }), // Cypress commands to retry
    Cypress._.isObject, // keep retrying until the task returns an object
    {
      timeout: 15000, // retry up to 15 seconds
      delay: 5000, // wait 5 seconds between attempts
    }
  )
    .its('html')
    .then((html) => {
      cy.document({ log: false }).invoke({ log: false }, 'write', html);
    });
}
