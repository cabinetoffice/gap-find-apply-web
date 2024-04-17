import { NextApiRequest, NextApiResponse } from 'next';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';
import { fromIni } from '@aws-sdk/credential-providers';

const isProd = process.env.NODE_ENV === 'production';

const credentials = fromIni({ profile: 'default' });

// this handler is required to pull shared AWS credentials stored locally
// for use in middleware, as the middleware cannot access the filesystem
// directly
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isProd) return res.status(403).json('local dev use only');
  res.status(200).json(await credentials());
}

const apiHandler = (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);

export default apiHandler;
