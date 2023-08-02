// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { verifyToken } from './services/JwtService';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const HOST = process.env.HOST;

// //it will apply the middleware to all those paths
export const config = {
  matcher: [
    '/applications/:path*',
    '/dashboard/:path*',
    '/organisation/:path*',
    '/personal-details/:path*',
    '/submissions/:path*',
    '/grant-is-closed',
  ],
};

function isWithinNumberOfMinsOfExpiry(expiresAt: Date, numberOfMins: number) {
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + numberOfMins);

  return expiresAt >= now && expiresAt <= nowPlusMins;
}

export function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
  const res = NextResponse.redirect(redirectUri);
  if (newApplicationPattern.test({ pathname: req.nextUrl.pathname })) {
    res.cookies.set(
      process.env.APPLYING_FOR_REDIRECT_COOKIE,
      newApplicationPattern.exec({ pathname: req.nextUrl.pathname }).pathname
        .groups.applicationId,
      {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 900,
      }
    );
  }

  return res;
}

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get(USER_TOKEN_NAME);

  const response = await fetch(`${HOST}/api/getJwt`, {
    method: 'get',
    headers: {
      Cookie: `${USER_TOKEN_NAME}=${cookie}`,
    },
  });

  const jwt = await response.text();

  if (!response.ok || jwt === 'undefined') {
    if (!response.ok) {
      const err = await response.text();
      console.error(err);
    }

    const res = buildMiddlewareResponse(req, HOST);
    return res;
  }

  try {
    const validJwtResponse = await verifyToken(jwt);
    const expiresAt = new Date(validJwtResponse.expiresAt);

    if (!validJwtResponse.valid) {
      return buildMiddlewareResponse(req, HOST);
    }

    if (isWithinNumberOfMinsOfExpiry(expiresAt, 30)) {
      return buildMiddlewareResponse(
        req,
        `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}${req.nextUrl.pathname}`
      );
    }
  } catch (err) {
    console.error('middleware error');
    console.error(err);
    return NextResponse.redirect(HOST);
  }
}

const newApplicationPattern = new URLPattern({
  pathname: '/applications/:applicationId([0-9]+)',
});
