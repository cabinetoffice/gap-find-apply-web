import {
  GetSecretValueCommand,
  SecretsManagerClient,
  SecretsManagerClientConfig,
} from '@aws-sdk/client-secrets-manager';
import { atou } from './utils';
import { logger } from '../logger';

const isProd = process.env.NODE_ENV === 'production';
const HOST = process.env.HOST;
const CSRF_SECRET_ARN = process.env.CSRF_SECRET_ARN;
const AWS_REGION = process.env.AWS_REGION;

const fetchCredentials = async () => {
  const response = await fetch(`${HOST}/api/aws-local`);
  const json = await response.json();
  return json;
};

let _client: SecretsManagerClient;

const getClient = async () => {
  if (!_client) {
    const clientConfig: SecretsManagerClientConfig = {};
    if (!isProd) {
      clientConfig.credentials = await fetchCredentials();
      clientConfig.region = AWS_REGION;
    }
    _client = new SecretsManagerClient(clientConfig);
  }
  return _client;
};

const fetchSecret = async () => {
  const getSecretCommand = new GetSecretValueCommand({
    SecretId: CSRF_SECRET_ARN,
  });
  try {
    logger.info('Fetching CSRF secret');
    const client = await getClient();
    const response = await client.send(getSecretCommand);
    return atou(JSON.parse(response.SecretString).csrfSecret);
  } catch (e) {
    // the sdk throws a string, not an error...
    if (typeof e === 'string') throw new Error(e);
    throw e;
  }
};

export const csrfSecret = {
  _lastFetch: Date.now(),
  // 10 mins
  _ttl: 600 * 1000,
  _value: '',
  async get() {
    if (!this._value || Date.now() - this._lastFetch >= this._ttl) {
      this._value = await fetchSecret();
      this._lastFetch = Date.now();
    }
    return this._value;
  },
};
