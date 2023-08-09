import { runSQL } from './database';

const userServiceDbName =
  process.env.CYPRESS_USER_SERVICE_DB_NAME || 'gapuserlocaldb';

export const createTestUsers = async () => {
  await runSQL('./cypress/seed/sql/addTestUsers.sql', userServiceDbName);
  console.log('Successfully added test users');
};

export const deleteTestUsers = async () => {
  await runSQL('./cypress/seed/sql/deleteTestUsers.sql', userServiceDbName);
  console.log('Successfully removed test users');
};
