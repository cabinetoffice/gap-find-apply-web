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
  if (IS_PRODUCTION) {
    const hostIsLocal = req.headers.host === hostDomain;
    // any request from the internet must come through a load balancer which will
    // add its own IP to this header - therefore the rightmost value of the header
    // (the load balancer itself) will always be from a trusted source, and we can
    // guarantee that we'll only get the value we're checking here with requests
    // made locally from our own application
    const forwardedForIsLocal = req.headers['x-forwarded-for'] === '::1';
    return hostIsLocal && forwardedForIsLocal;
    // if we're not in production, then we must be running locally
  } else return true;
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!isLocalCall(req)) return res.status(404);
  res.status(200).json({ secret: await fetchSecret() });
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
