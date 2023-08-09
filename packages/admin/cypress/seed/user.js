import { databases, runSQL } from './database';

export const createTestUsers = () => {
  console.log('Adding test users...');
  runSQL(
    './cypress/seed/sql/addTestUsers.sql',
    databases.userServiceDbName
  ).then(() => {
    console.log('Test users successfully added!');
  });
};

export const deleteTestUsers = () => {
  console.log('Deleting test users...');
  runSQL(
    './cypress/seed/sql/deleteTestUsers.sql',
    databases.userServiceDbName
  ).then(() => {
    console.log('Test users successfully deleted!');
  });
};
