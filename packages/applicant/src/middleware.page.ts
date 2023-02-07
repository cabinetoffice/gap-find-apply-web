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

function tokenHasExpired(validJwtResponse) {
  return new Date(validJwtResponse.expiresAt).getTime() < Date.now();
}

function isWithinNumberOfMinsOfExpiry(expiresAt: Date, numberOfMins: number) {
  const expiryDateMinusMins = new Date(expiresAt);
  expiryDateMinusMins.setMinutes(
    expiryDateMinusMins.getMinutes() - numberOfMins
  );

  return expiryDateMinusMins.getTime() <= Date.now();
}

function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
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

    const res = buildMiddlewareResponse(
      req,
      process.env.APPLICANT_FRONTEND_URL_NO_VALID_TOKEN
    );
    return res;
  }

  try {
    const validJwtResponse = await verifyToken(jwt);

    // can't currently refresh expired tokens because of a bug with COLA so user will have to log in again
    if (tokenHasExpired(validJwtResponse)) {
      return buildMiddlewareResponse(
        req,
        process.env.APPLICANT_FRONTEND_URL_NO_VALID_TOKEN
      );
    }

    if (
      !validJwtResponse.valid ||
      isWithinNumberOfMinsOfExpiry(new Date(validJwtResponse.expiresAt), 30)
    ) {
      const refreshUrl = `${process.env.REFRESH_URL}?refresh=${process.env.SUB_PATH}${req.nextUrl.pathname}`;
      const res = buildMiddlewareResponse(req, refreshUrl);
      return res;
    }
  } catch (err) {
    console.error('middleware error');
    console.error(err);
    return NextResponse.redirect(
      process.env.APPLICANT_FRONTEND_URL_NO_VALID_TOKEN
    );
  }
}

const newApplicationPattern = new URLPattern({
  pathname: '/applications/:applicationId([0-9]+)',
});
