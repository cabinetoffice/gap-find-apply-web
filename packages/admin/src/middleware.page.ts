// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { v4 } from 'uuid';
import { getLoginUrl, parseJwt } from './utils/general';
import { isAdminSessionValid } from './services/UserService';
import { csrfMiddleware } from './utils/csrfMiddleware';
import { logger } from './utils/logger';
import { HEADERS } from './utils/constants';

const authenticateRequest = async (req: NextRequest, res: NextResponse) => {
  const authCookie = req.cookies.get('session_id');
  const userJwtCookie = req.cookies.get(process.env.JWT_COOKIE_NAME);

  await csrfMiddleware(req, res);
  //means that the user is logged in but not as an admin/superAdmin(otherwise they would have had the session_id cookie set)
  if (!authCookie && userJwtCookie) {
    const url = getLoginUrl({ redirectTo404: true });
    logger.info(
      `User is not an admin - redirecting it to appropriate app 404 page`
    );
    return NextResponse.redirect(url);
  }
  //means user is not logged in
  if (!authCookie || !userJwtCookie) {
    let url = getLoginUrl();
    if (isSubmissionExportLink(req)) {
      url += `?${generateRedirectUrl(req)}`;
    }
    logger.info(`Not authorised - logging in via: ${url}`);
    return NextResponse.redirect(url, { status: 302 });
  }

  const isValidSession = await isValidAdminSession(authCookie);
  //user has the session_id cookie set but not valid
  if (!isValidSession) {
    const url = getLoginUrl({ redirectToApplicant: true });
    logger.info(`Admin session invalid - logging in via applicant app: ${url}`);
    return NextResponse.redirect(url, { status: 302 });
  }

  if (hasJwtExpired(userJwtCookie)) {
    const url = `${getLoginUrl()}?${generateRedirectUrl(req)}`;
    logger.info(`Jwt expired - logging in via: ${url}`);
    return NextResponse.redirect(url, { status: 302 });
  }

  if (isJwtExpiringSoon(userJwtCookie)) {
    const url = `${process.env.REFRESH_URL}?${generateRedirectUrl(req)}`;
    logger.info(`Refreshing JWT - redircting to: ${url}`);
    return NextResponse.redirect(url, { status: 307 });
  }

  if (isAdBuilderRedirectAndDisabled(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/404';
    logger.info(`Ad builder disabled - redirecting to 404: ${url.toString()}`);
    return NextResponse.redirect(url, { status: 302 });
  }

  logger.info('User is authorised');
  addAdminSessionCookie(res, authCookie);
  res.headers.set('Cache-Control', 'no-store');
  return res;
};

const httpLoggers = {
  req: (req: NextRequest) => {
    const correlationId = v4();
    req.headers.set(HEADERS.CORRELATION_ID, correlationId);
    logger.http('Incoming request', {
      ...logger.utils.formatRequest(req),
      correlationId,
    });
  },
  res: (req: NextRequest, res: NextResponse) =>
    logger.http(
      'Outgoing response - PLEASE NOTE: this represents a snapshot of the response as it exits the middleware, changes made by other server code (eg getServerSideProps) will not be shown',
      {
        ...logger.utils.formatResponse(res),
        correlationId: req.headers.get(HEADERS.CORRELATION_ID),
      }
    ),
};

type LoggerType = keyof typeof httpLoggers;

const urlsToSkip = ['/_next/', '/assets/', '/javascript/'];

const getConditionalLogger = (req: NextRequest, type: LoggerType) => {
  const userAgentHeader = req.headers.get('user-agent') || '';
  const shouldSkipLogging =
    userAgentHeader.startsWith('ELB-HealthChecker') ||
    urlsToSkip.some((url) => req.nextUrl.pathname.startsWith(url));
  return shouldSkipLogging ? () => undefined : httpLoggers[type];
};

const authenticatedPaths = [
  '/build-application/:path*',
  '/dashboard/:path*',
  '/new-scheme/:path*',
  '/scheme/:path*',
  '/scheme-list/:path*',
  '/super-admin-dashboard/:path*',
].map((pathname) => new URLPattern({ pathname }));

const isAuthenticatedPath = (pathname: string) =>
  authenticatedPaths.some((authenticatedPath) =>
    authenticatedPath.test({ pathname })
  );

export async function middleware(req: NextRequest) {
  const logRequest = getConditionalLogger(req, 'req');
  const logResponse = getConditionalLogger(req, 'res');
  let res = NextResponse.next();
  logRequest(req, res);

  if (isAuthenticatedPath(req.nextUrl.pathname)) {
    res = await authenticateRequest(req, res);
    await csrfMiddleware(req, res);
  }
  logResponse(req, res);
  return res;
}

function generateRedirectUrl(req: NextRequest) {
  const redirectUrl = process.env.HOST + req.nextUrl.pathname;
  const redirectUrlSearchParams = encodeURIComponent(
    req.nextUrl.searchParams.toString()
  );
  return `redirectUrl=${redirectUrl}${
    redirectUrlSearchParams ? '?' + redirectUrlSearchParams : ''
  }`;
}

function addAdminSessionCookie(res: NextResponse, authCookie: RequestCookie) {
  res.cookies.set('session_id', authCookie.value, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: parseInt(process.env.MAX_COOKIE_AGE!),
  });
}

function isAdBuilderRedirectAndDisabled(req: NextRequest) {
  const advertBuilderPath = /\/scheme\/\d*\/advert/;
  return (
    process.env.FEATURE_ADVERT_BUILDER === 'disabled' &&
    advertBuilderPath.test(req.nextUrl.pathname)
  );
}

function isSubmissionExportLink(req: NextRequest) {
  const submissionDownloadPattern = new URLPattern({
    pathname: '/scheme/:schemeId([0-9]+)/:exportBatchUuid([0-9a-f-]+)',
  });
  return submissionDownloadPattern.test({ pathname: req.nextUrl.pathname });
}

async function isValidAdminSession(authCookie: RequestCookie) {
  if (process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE !== 'true') return true;
  return await isAdminSessionValid(authCookie.value);
}

function hasJwtExpired(jwtCookie: RequestCookie) {
  const jwt = parseJwt(jwtCookie.value);
  const expiresAt = new Date(jwt.exp * 1000);
  const now = new Date();
  return expiresAt <= now;
}

function isJwtExpiringSoon(jwtCookie: RequestCookie) {
  const jwt = parseJwt(jwtCookie.value);
  const expiresAt = new Date(jwt.exp * 1000);
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + 30);
  return expiresAt >= now && expiresAt <= nowPlusMins;
}

type RequestCookie = Exclude<
  ReturnType<NextRequest['cookies']['get']>,
  undefined
>;
