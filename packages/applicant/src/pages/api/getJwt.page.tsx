import cookie from 'cookie';
import cookieParser from 'cookie-parser';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
  const COOKIE_SECRET = process.env.COOKIE_SECRET;

  // Implementation below replicates that of a lambda function
  // cabinet office have:
  // https://github.com/cabinetoffice/x-co-login-auth-lambda/blob/22ce5fa104d2a36016a79f914d238f53ddabcee4/src/controllers/http/v1/request/utils.js#L81
  const cookieValue = req.cookies[USER_TOKEN_NAME];
  const parsedCookie = cookie.parse(`connect.sid=${cookieValue}`)[
    'connect.sid'
  ];

  // If the cookie is not a signed cookie, the parser will return the provided value
  const unsignedCookie = cookieParser.signedCookie(parsedCookie, COOKIE_SECRET);

  if (!unsignedCookie) {
    res.status(500).send('Failed to verify cookie.');
  }
  res.status(200).send(unsignedCookie);
}
