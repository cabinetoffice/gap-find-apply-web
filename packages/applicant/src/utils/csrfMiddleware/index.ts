// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import {
  getTokenFromRequest,
  createToken,
  verifyToken,
  utoa,
  atou,
  createSecret,
} from './utils';

const METHODS_TO_IGNORE = ['GET', 'HEAD', 'OPTIONS'];
const PATHS_TO_EXCLUDE = ['/_next/'];
const SALT_BYTE_LENGTH = 8;
const SECRET_BYTE_LENGTH = 18;
const secret = createSecret(SECRET_BYTE_LENGTH);
const CSRF_HEADER_NAME = 'x-csrf-token';

export const csrfMiddleware = async (
  request: NextRequest,
  response: NextResponse
) => {
  for (const path of PATHS_TO_EXCLUDE) {
    if (request.nextUrl.pathname.startsWith(path)) return null;
  }

  // verify on POST (or PUT, PATCH etc)
  if (!METHODS_TO_IGNORE.includes(request.method)) {
    const token = await getTokenFromRequest(request, CSRF_HEADER_NAME);
    const tokenVerified = await verifyToken(atou(token), secret);
    if (!tokenVerified) {
      throw new Error(`CSRF token validation failed for token ${token}`);
    }
  }

  // set new token
  const newToken = await createToken(secret, SALT_BYTE_LENGTH);
  response.headers.set(CSRF_HEADER_NAME, utoa(newToken));
  return response;
};
