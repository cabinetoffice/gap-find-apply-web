// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { isAdminSessionValid } from './services/UserService';
import { csrfMiddleware } from './utils/csrfMiddleware';
import { getLoginUrl, parseJwt } from './utils/general';

// It will apply the middleware to all those paths
// (if new folders at page root are created, they need to be included here)
export const config = {
  matcher: [
    '/build-application/:path*',
    '/dashboard/:path*',
    '/new-scheme/:path*',
    '/scheme/:path*',
    '/scheme-list/:path*',
    '/super-admin-dashboard/:path*',
  ],
};

const redirectToAppliantLogin = () =>
  NextResponse.redirect(getLoginUrl({ redirectToApplicant: true }), {
    status: 302,
  });

function redirectToLogin(req: NextRequest) {
  const url = getLoginUrl();
  console.log('Middleware redirect URL: ' + url);
  if (submissionDownloadPattern.test({ pathname: req.nextUrl.pathname })) {
    console.log('Getting submission export download redirect URL: ' + url);
    return NextResponse.redirect(url + req.nextUrl.pathname);
  }
  console.log('Final redirect URL from admin middleware: ' + url);
  return NextResponse.redirect(url);
}

function isWithinNumberOfMinsOfExpiry(expiresAt: Date, numberOfMins: number) {
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + numberOfMins);

  return expiresAt >= now && expiresAt <= nowPlusMins;
}

export async function middleware(req: NextRequest) {
  const rewriteUrl = req.url;
  const res = NextResponse.rewrite(rewriteUrl);
  await csrfMiddleware(req, res);

  const authCookie = req.cookies.get('session_id');
  const userJwtCookie = req.cookies.get(process.env.JWT_COOKIE_NAME);

  //Feature flag redirects
  const advertBuilderPath = /\/scheme\/\d*\/advert/;

  if (process.env.FEATURE_ADVERT_BUILDER === 'disabled') {
    if (advertBuilderPath.test(req.nextUrl.pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = `/404`;
      return NextResponse.redirect(url);
    }
  }

  if (userJwtCookie === undefined) return redirectToLogin(req);

  const jwt = parseJwt(userJwtCookie.value);
  const jwtExpiry = new Date(jwt.exp * 1000);

  if (isWithinNumberOfMinsOfExpiry(jwtExpiry, 30)) {
    return NextResponse.redirect(
      `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}${
        req.nextUrl.pathname
      }?${encodeURIComponent(req.nextUrl.searchParams.toString())}`
    );
  }

  if (authCookie !== undefined) {
    if (process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE === 'true') {
      const isValidAdminSession = await isAdminSessionValid(authCookie.value);
      if (!isValidAdminSession) {
        return redirectToAppliantLogin();
      }
    }

    res.cookies.set('session_id', authCookie.value, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: parseInt(process.env.MAX_COOKIE_AGE!),
    });

    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
  return redirectToLogin(req);
}

const submissionDownloadPattern = new URLPattern({
  pathname: '/scheme/:schemeId([0-9]+)/:exportBatchUuid([0-9a-f-]+)',
});
