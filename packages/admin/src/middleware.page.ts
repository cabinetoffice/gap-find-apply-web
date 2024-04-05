// eslint-disable-next-line  @next/next/no-server-import-in-page
import { type NextRequest, NextResponse, URLPattern } from 'next/server';
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

export async function middleware(req: NextRequest) {
  const rewriteUrl = req.url;
  const res = NextResponse.rewrite(rewriteUrl);
  const authCookie = req.cookies.get('session_id');
  const userJwtCookie = req.cookies.get(process.env.JWT_COOKIE_NAME);

  await csrfMiddleware(req, res);

  if (!authCookie || !userJwtCookie) {
    let url = getLoginUrl();
    if (isSubmissionExportLink(req)) {
      url += `?redirectUrl=${process.env.HOST}${req.nextUrl.pathname}`;
    }
    console.log(`Not authorised - logging in via: ${url}`);
    return NextResponse.redirect(url);
  }

  const isValidSession = await isValidAdminSession(authCookie);
  if (!isValidSession) {
    const url = getLoginUrl({ redirectToApplicant: true });
    console.log(`Not authorised - logging in via applicant app: ${url}`);
    return NextResponse.redirect(url, {
      status: 302,
    });
  }

  if (isAdBuilderRedirectAndDisabled(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/404';
    console.log(`Ad builder disabled - redirecting to 404: ${url.toString()}`);
    return NextResponse.redirect(url);
  }

  if (isJwtExpiringSoon(userJwtCookie)) {
    const url = process.env.REFRESH_URL;
    const redirectUrl = process.env.HOST + req.nextUrl.pathname;
    const redirectUrlSearchParams = encodeURIComponent(
      req.nextUrl.searchParams.toString()
    );
    console.log(`Refreshing JWT - redircting to: ${url}`);
    return NextResponse.redirect(
      `${url}?redirectUrl=${redirectUrl}?${redirectUrlSearchParams}`
    );
  }

  res.cookies.set('session_id', authCookie.value, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: parseInt(process.env.MAX_COOKIE_AGE!),
  });
  console.log('User is authorised');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

function isAdBuilderRedirectAndDisabled(req: NextRequest) {
  const advertBuilderPath = /\/scheme\/\d*\/advert/;
  return (
    process.env.FEATURE_ADVERT_BUILDER === 'disabled' &&
    advertBuilderPath.test(req.nextUrl.pathname)
  );
}

// Moving this into the functions scope apparently breaks 2 tests???
const submissionDownloadPattern = new URLPattern({
  pathname: '/scheme/:schemeId([0-9]+)/:exportBatchUuid([0-9a-f-]+)',
});
function isSubmissionExportLink(req: NextRequest) {
  return submissionDownloadPattern.test({ pathname: req.nextUrl.pathname });
}

type RequestCookie = Exclude<
  ReturnType<NextRequest['cookies']['get']>,
  undefined
>;

async function isValidAdminSession(authCookie: RequestCookie) {
  if (process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE !== 'true') return true;
  return await isAdminSessionValid(authCookie.value);
}

function isJwtExpiringSoon(jwtCookie: RequestCookie) {
  const jwt = parseJwt(jwtCookie.value);
  const expiresAt = new Date(jwt.exp * 1000); //jwt.exp is stored in seconds, this converts to ms as expected in Date
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + 30);
  return expiresAt >= now && expiresAt <= nowPlusMins;
}
