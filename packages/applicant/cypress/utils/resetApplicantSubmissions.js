import { connection } from '../constants/constants';

export default function resetApplicantSubmissions(applicantId) {
  cy.task('dbQuery', {
    query: `UPDATE grant_submission SET applicant_id=${applicantId} WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf205'`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query: `UPDATE grant_submission SET applicant_id=${applicantId} WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf206'`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query: `UPDATE grant_submission SET applicant_id=${applicantId} WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf207'`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query: `UPDATE grant_submission SET applicant_id=${applicantId} WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf208'`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query: `UPDATE grant_submission SET applicant_id=${applicantId} WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf209'`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
