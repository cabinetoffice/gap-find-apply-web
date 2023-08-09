import { Client } from 'pg';
import fs from 'fs/promises';

const databaseUrl =
  process.env.CYPRESS_DATABASE_URL ||
  'postgres://postgres:postgres@localhost:5432';

export const runSQL = async (filePath, dbName) => {
  try {
    const connectionString = getConnectionStringByDbName(dbName);
    const sqlScript = await fs.readFile(filePath, 'utf8');
    const client = new Client({ connectionString });
    await client.connect();
    console.log('sqlScript: ', sqlScript);
    await client.query(sqlScript);
    await client.end();

    console.log('SQL script executed successfully.');
  } catch (error) {
    console.error('Error executing SQL script:', error);
  }
};

export const getConnectionStringByDbName = (dbName) => {
  return `${databaseUrl}/${dbName}`;
};
