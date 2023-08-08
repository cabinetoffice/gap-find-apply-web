import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.redirect(
    process.env.ONE_LOGIN_ENABLED === 'true'
      ? process.env.V2_LOGOUT_URL
      : process.env.LOGOUT_URL
  );
}
