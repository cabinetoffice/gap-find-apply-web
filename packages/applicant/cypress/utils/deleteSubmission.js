import { connection } from '../constants/constants';

export default function deleteSubmission(applicationId) {
  cy.task('dbQuery', {
    query: `DELETE FROM public.grant_submission WHERE application_id=${applicationId}`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
