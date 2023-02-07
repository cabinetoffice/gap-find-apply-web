/* eslint-disable */
// use Nodemailer to get an Ethereal email inbox
// https://nodemailer.com/about/
const nodemailer = require('nodemailer');
// used to check the email inbox
const imaps = require('imap-simple');
// used to parse emails from the inbox
const simpleParser = require('mailparser').simpleParser;
require('dotenv').config();

const makeEmailAccount = async () => {
  // Generate a new Ethereal email inbox account
  const testAccount = {
    user: process.env.QA_TEST_EMAIL,
    pass: process.env.QA_TEST_EMAIL_PASSWORD,
  };

  const emailConfig = {
    imap: {
      user: testAccount.user,
      password: testAccount.pass,
      host: 'imap.mail.yahoo.com',
      port: 993,
      tls: true,
      authTimeout: 10000,
    },
  };

  const userEmail = {
    email: testAccount.user,

    /**
     * Utility method for getting the last email
     * for the Ethereal email account created above.
     */
    async getLastEmail({ keepEmails }) {
      // makes debugging very simple

      try {
        const connection = await imaps.connect(emailConfig);

        // grab up to 50 emails from the inbox
        await connection.openBox('INBOX');
        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
          bodies: [''],
        };
        const messages = await connection.search(searchCriteria, fetchOptions);
        const uidsToDelete =
          keepEmails === true
            ? (uidsToDelete = [])
            : messages.map((message) => message.attributes.uid);

        if (uidsToDelete.length > 0) {
          connection.deleteMessage(uidsToDelete);
        }
        // and close the connection to avoid it hanging
        connection.end();

        if (!messages.length) {
          console.log('cannot find any emails');
          return null;
        } else {
          console.log('there are %d messages', messages.length);
          // grab the last email
          const mail = await simpleParser(
            messages[messages.length - 1].parts[0].body
          );
          // and returns the main fields
          return {
            subject: mail.subject,
            text: mail.text,
            html: mail.html,
          };
        }
      } catch (e) {
        console.error(e);
        return null;
      }
    },
  };

  return userEmail;
};

module.exports = makeEmailAccount;
