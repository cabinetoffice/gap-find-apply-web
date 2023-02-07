import { connection } from '../constants/constants';

export default function resetSubmissionTables() {
  cy.task('dbQuery', {
    query: 'DELETE FROM diligence_check',
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query:
      "DELETE FROM public.grant_beneficiary WHERE submission_id='3a6cfe2d-bf58-440d-9e07-3579c7dcf207'",
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
  cy.task('dbQuery', {
    query:
      "UPDATE public.grant_submission SET status='IN_PROGRESS', submitted_date=null, gap_id=null WHERE id='3a6cfe2d-bf58-440d-9e07-3579c7dcf207'",
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
