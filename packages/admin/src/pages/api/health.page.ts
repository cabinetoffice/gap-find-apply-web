import { NextApiRequest, NextApiResponse } from 'next';
import { APIGlobalHandler } from '../../utils/apiErrorHandler';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json('admin up');
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  APIGlobalHandler(req, res, handler);
