import { NextApiRequest, NextApiResponse } from 'next';
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';
import { IS_PRODUCTION } from '../../utils/constants';
import { logger } from '../../utils/logger';

const CSRF_SECRET_ARN = process.env.CSRF_SECRET_ARN;
const hostDomain = 'localhost:3000';

const client = new SecretsManagerClient();

const fetchSecret = async () => {
  const getSecretCommand = new GetSecretValueCommand({
    SecretId: CSRF_SECRET_ARN,
  });
  try {
    logger.info('Fetching CSRF secret');
    const response = await client.send(getSecretCommand);
    return JSON.parse(response.SecretString).csrfSecret;
  } catch (e) {
    // the aws sdk throws a string, not an error...
    if (typeof e === 'string') throw new Error(e);
    throw e;
  }
};

const isLocalCall = (req: NextApiRequest) => {
  if (IS_PRODUCTION) return req.headers.host === hostDomain;
  else return true;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isLocalCall(req)) return res.status(404);
  res.status(200).json({ secret: await fetchSecret() });
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
