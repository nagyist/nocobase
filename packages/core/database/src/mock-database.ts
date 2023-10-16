import { merge, uid } from '@nocobase/utils';
import { resolve } from 'path';
import { Database, IDatabaseOptions } from './database';
import fetch from 'node-fetch';

export class MockDatabase extends Database {
  constructor(options: IDatabaseOptions) {
    super({
      storage: ':memory:',
      dialect: 'sqlite',
      ...options,
    });
  }
}

export function getConfigByEnv() {
  const options = {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'sqlite',
    logging: process.env.DB_LOGGING === 'on' ? customLogger : false,
    storage:
      process.env.DB_STORAGE && process.env.DB_STORAGE !== ':memory:'
        ? resolve(process.cwd(), process.env.DB_STORAGE)
        : ':memory:',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    timezone: process.env.DB_TIMEZONE,
    underscored: process.env.DB_UNDERSCORED === 'true',
    schema: process.env.DB_SCHEMA !== 'public' ? process.env.DB_SCHEMA : undefined,
    dialectOptions: {},
  };

  if (process.env.DB_DIALECT == 'postgres') {
    options.dialectOptions['application_name'] = 'nocobase.main';
  }

  return options;
}

function customLogger(queryString, queryObject) {
  console.log(queryString); // outputs a string
  if (queryObject.bind) {
    console.log(queryObject.bind); // outputs an array
  }
}

export function mockDatabase(options: IDatabaseOptions = {}): MockDatabase {
  const dbOptions = merge(getConfigByEnv(), options) as any;

  if (process.env['DB_TEST_DISTRIBUTOR_PORT']) {
    const dialect = options.dialect;
    if (dialect === 'sqlite' && options.storage == ':memory:') {
      return;
    }

    dbOptions.hooks = dbOptions.hooks || {};
    dbOptions.customHooks = dbOptions.customHooks || {};

    dbOptions.hooks.beforeConnect = async (config) => {
      const hasAutoNamedDatabase = config.database.startsWith('auto_named_');

      let url = `http://127.0.0.1:${process.env['DB_TEST_DISTRIBUTOR_PORT']}/acquire?via=${db.instanceId}`;

      if (hasAutoNamedDatabase) {
        url += `&name=${db.options.database}`;
      }

      const response = await fetch(url);

      const databaseResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to aquire database: ${databaseResponse.error}`);
      }

      if (hasAutoNamedDatabase) {
        return;
      }

      config.dialectOptions['application_name'] = expect.getState().currentTestName;

      db.options.database = config.database = databaseResponse.name;

      if (db.context.app?.options?.database) {
        db.context.app.options.database.database = config.database;
      }
    };

    dbOptions.customHooks.afterClose = async (database) => {
      if (!database.options.database.startsWith('auto_named_')) {
        return;
      }

      const url = `http://127.0.0.1:${process.env['DB_TEST_DISTRIBUTOR_PORT']}/release?name=${database.options.database}&via=${db.instanceId}`;
      await fetch(url);
    };
  }

  const db = new MockDatabase(dbOptions);

  return db;
}
