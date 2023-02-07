/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
require('dotenv').config();
const makeEmailAccount = require('./email-account');

// eslint-disable-next-line no-unused-vars
module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const emailAccount = await makeEmailAccount();
  on('task', {
    dbQuery: (query) =>
      require('cypress-postgres')(query.query, query.connection),
    log(message) {
      console.log(message);
      return null;
    },
    table(message) {
      console.table(message);
      return null;
    },

    getUserEmail() {
      return emailAccount.email;
    },
    getLastEmail(keepEmails) {
      return emailAccount.getLastEmail(keepEmails);
    },
  });
  return config;
};
