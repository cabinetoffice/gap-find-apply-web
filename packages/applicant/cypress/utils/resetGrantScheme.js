import { connection } from '../constants/constants';

export default function resetGrantScheme() {
  cy.task('dbQuery', {
    query: ` UPDATE grant_scheme SET scheme_contact='grantadmin@and.digital' WHERE grant_scheme_id=1`,
    connection: connection,
  }).then((queryResponse) => {
    console.log('queried response', queryResponse);
  });
}
