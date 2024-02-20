// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { v4 } from 'uuid';
import { getLoginUrl } from './utils/general';
import { isAdminSessionValid } from './services/UserService';
import { csrfMiddleware } from './utils/csrfMiddleware';
import { logger } from './utils/logger';
import { HEADERS } from './utils/constants';

const authenticateRequest = async (req: NextRequest, res: NextResponse) => {
  const auth_cookie = req.cookies.get('session_id');
  //Feature flag redirects
  const advertBuilderPath = /\/scheme\/\d*\/advert/;

  if (process.env.FEATURE_ADVERT_BUILDER === 'disabled') {
    if (advertBuilderPath.test(req.nextUrl.pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = `/404`;
      return NextResponse.redirect(url);
    }
  }

  if (auth_cookie !== undefined) {
    if (process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE === 'true') {
      const isValidAdminSession = await isAdminSessionValid(auth_cookie.value);
      if (!isValidAdminSession) {
        return NextResponse.redirect(
          getLoginUrl({ redirectToApplicant: true }),
          { status: 302 }
        );
      }
    }

    res.cookies.set('session_id', auth_cookie.value, {
      path: '/',
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      maxAge: parseInt(process.env.MAX_COOKIE_AGE!),
    });

    res.headers.set('Cache-Control', 'no-store');

    return res;
  } else {
    return NextResponse.redirect(getLoginUrl());
  }
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
].map((path) => new URLPattern({ pathname: path }));

const isAuthenticatedPath = (pathname: string) =>
  authenticatedPaths.some((authenticatedPath) =>
    authenticatedPath.test({ pathname })
  );

export async function middleware(req: NextRequest) {
  const logRequest = getConditionalLogger(req, 'req');
  const logResponse = getConditionalLogger(req, 'res');
  const rewriteUrl = req.url;
  let res = NextResponse.rewrite(rewriteUrl);
  logRequest(req, res);

  if (isAuthenticatedPath(req.nextUrl.pathname)) {
    await csrfMiddleware(req, res);
    res = await authenticateRequest(req, res);
  }
  logResponse(req, res);
  return res;
}
