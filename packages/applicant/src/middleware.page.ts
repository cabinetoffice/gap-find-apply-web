import cookie from 'cookie';
import cookieParser from 'cookie-parser';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { verifyToken } from './services/JwtService';

const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const HOST = process.env.HOST;
const ONE_LOGIN_ENABLED = process.env.ONE_LOGIN_ENABLED === 'true';

// //it will apply the middleware to all those paths
export const config = {
  matcher: [
    '/applications/:path*',
    '/dashboard/:path*',
    '/organisation/:path*',
    '/personal-details/:path*',
    '/submissions/:path*',
    '/grant-is-closed',
    '/sign-in-details',
    '/api/redirect-from-find',
    '/mandatory-questions/:path*',
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
  if (mandatoryQuestionsStartPattern.test({ pathname: req.nextUrl.pathname })) {
    const url =
      redirectUri +
      '?redirectUrl=' +
      process.env.HOST +
      req.nextUrl.pathname +
      req.nextUrl.search;
    return NextResponse.redirect(url);
  }
  if (newApplicationPattern.test({ pathname: req.nextUrl.pathname })) {
    res.cookies.set(
      process.env.APPLYING_FOR_REDIRECT_COOKIE,
      newApplicationPattern.exec({ pathname: req.nextUrl.pathname }).pathname
        .groups.applicationId,
      {
        path: '/',
        secure: true,
        httpOnly: true,
        maxAge: 900,
      }
    );
  } else if (
    process.env.MANDATORY_QUESTIONS_ENABLED === 'true' &&
    redirectFromFindPattern.test({ pathname: req.nextUrl.pathname })
  ) {
    res.cookies.set(process.env.FIND_REDIRECT_COOKIE, req.nextUrl.search, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 900,
    });
  }

  return res;
}

export const getJwtFromMiddlewareCookies = (req: NextRequest) => {
  const COOKIE_SECRET = process.env.COOKIE_SECRET;

  // Implementation below replicates that of a lambda function
  // cabinet office have:
  // https://github.com/cabinetoffice/x-co-login-auth-lambda/blob/22ce5fa104d2a36016a79f914d238f53ddabcee4/src/controllers/http/v1/request/utils.js#L81
  const cookieValue = req.cookies.get(USER_TOKEN_NAME);
  const parsedCookie = cookie.parse(`connect.sid=${cookieValue}`)[
    'connect.sid'
  ];

  // If the cookie is not a signed cookie, the parser will return the provided value
  const unsignedCookie = cookieParser.signedCookie(parsedCookie, COOKIE_SECRET);

  if (!unsignedCookie || unsignedCookie === 'undefined') {
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`
    );
  }

  return unsignedCookie;
};

export async function middleware(req: NextRequest) {
  if (signInDetailsPage.test({ pathname: req.nextUrl.pathname })) {
    if (!ONE_LOGIN_ENABLED) {
      const url = req.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.redirect(url);
    } else {
      return NextResponse.next();
    }
  }

  let jwt: string;
  try {
    jwt = await getJwtFromMiddlewareCookies(req);
  } catch (err) {
    console.error(err);
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
        `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}${
          req.nextUrl.pathname
        }?${req.nextUrl.searchParams.toString()}`
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

const redirectFromFindPattern = new URLPattern({
  pathname: '/api/redirect-from-find',
});

const signInDetailsPage = new URLPattern({
  pathname: '/sign-in-details',
});

const mandatoryQuestionsStartPattern = new URLPattern({
  pathname: '/mandatory-questions/start',
});
