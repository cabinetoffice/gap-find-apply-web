import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse, URLPattern } from 'next/server';
import { verifyToken } from './services/JwtService';
import { csrfMiddleware } from './utils/csrfMiddleware';
import { HEADERS } from './utils/constants';
import { logger } from './utils/logger';

const BACKEND_HOST = process.env.BACKEND_HOST;
const USER_TOKEN_NAME = process.env.USER_TOKEN_NAME;
const HOST = process.env.HOST;
const ONE_LOGIN_ENABLED = process.env.ONE_LOGIN_ENABLED === 'true';
const GRANT_CLOSED_REDIRECT = '/grant-is-closed';

const patterns = {
  newApplication: new URLPattern({
    pathname: '/applications/:applicationId([0-9]+)',
  }),
  redirectFromFind: new URLPattern({ pathname: '/api/redirect-from-find' }),
  signInDetails: new URLPattern({ pathname: '/sign-in-details' }),
  mandatoryQuestionsStart: new URLPattern({
    pathname: '/mandatory-questions/start',
  }),
  mandatoryQuestionsJourney: new URLPattern({
    pathname: '/mandatory-questions/:questionUuid([0-9a-f-]+)/:path*',
  }),
  submissionJourney: new URLPattern({ pathname: '/submissions/:path*' }),
};

function isWithinNumberOfMinsOfExpiry(expiresAt: Date, numberOfMins: number) {
  const now = new Date();
  const nowPlusMins = new Date();
  nowPlusMins.setMinutes(now.getMinutes() + numberOfMins);

  return expiresAt >= now && expiresAt <= nowPlusMins;
}

export function buildMiddlewareResponse(req: NextRequest, redirectUri: string) {
  const res = NextResponse.redirect(redirectUri);
  if (
    patterns.mandatoryQuestionsStart.test({ pathname: req.nextUrl.pathname })
  ) {
    const url =
      redirectUri +
      '?redirectUrl=' +
      process.env.HOST +
      req.nextUrl.pathname +
      req.nextUrl.search;
    return NextResponse.redirect(url);
  }
  if (patterns.newApplication.test({ pathname: req.nextUrl.pathname })) {
    res.cookies.set(
      process.env.APPLYING_FOR_REDIRECT_COOKIE,
      patterns.newApplication.exec({ pathname: req.nextUrl.pathname }).pathname
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
    patterns.redirectFromFind.test({ pathname: req.nextUrl.pathname })
  ) {
    res.cookies.set(process.env.FIND_REDIRECT_COOKIE, req.nextUrl.search, {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: 900,
    });
  }
  const logResponse = getConditionalLogger(req, 'res');
  logResponse(req, res);
  return res;
}

export const getJwtFromMiddlewareCookies = (req: NextRequest) => {
  const COOKIE_SECRET = process.env.COOKIE_SECRET;

  const userTokenCookie = req.cookies.get(USER_TOKEN_NAME);

  if (!userTokenCookie)
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: cookie not found`
    );

  const cookieValue = userTokenCookie.value;

  // If the cookie is not a signed cookie, the parser will return the provided value
  const unsignedCookie = cookieParser.signedCookie(cookieValue, COOKIE_SECRET);

  if (!unsignedCookie || unsignedCookie === 'undefined') {
    throw new Error(
      `Failed to verify signature for ${USER_TOKEN_NAME} cookie: ${cookieValue}`
    );
  }

  return unsignedCookie;
};

const getApplicationStatusBySubmissionId = async (
  id: string,
  jwt: string,
  pathname: string
) => {
  const url = pathname.includes('mandatory-questions')
    ? `${BACKEND_HOST}/grant-mandatory-questions/${id}/application/status`
    : `${BACKEND_HOST}/submissions/${id}/application/status`;
  const data = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/json',
    },
  });
  return await data.text();
};

async function getIsSubmissionSubmitted(id: string, jwt: string) {
  const url = `${BACKEND_HOST}/submissions/${id}/isSubmitted`;
  const data = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: 'application/json',
    },
  });
  const result = await data.text();
  return result === 'true';
}
async function schemeHasInternalApplicationForm(jwt: string, schemeId: string) {
  try {
    const url = `${BACKEND_HOST}/grant-schemes/${schemeId}/hasInternalApplication`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch schemeHasInternalApplicationForm');
    }

    const json = await response.json();
    return json;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching schemeHasInternalApplicationForm:', error);
  }
}
async function getMandatoryQuestion(mandatoryQuestionId: string, jwt: string) {
  try {
    const url = `${BACKEND_HOST}/grant-mandatory-questions/${mandatoryQuestionId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mandatory question');
    }

    const json = await response.json();
    return json;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching mandatory question:', error);
  }
}
async function getMandatoryQuestionApplicationInfos(req: NextRequest, jwt) {
  const uuidRegex = /\/([0-9a-fA-F-]+)\//;
  const mandatoryQuestionId = uuidRegex.exec(req.nextUrl.pathname)[1];
  const mandatoryQuestion = await getMandatoryQuestion(
    mandatoryQuestionId,
    jwt
  );
  const { hasInternalApplication, hasPublishedInternalApplication } =
    await schemeHasInternalApplicationForm(jwt, mandatoryQuestion.schemeId);

  return {
    hasInternalApplication,
    hasPublishedInternalApplication,
  };
}
async function shouldRedirectToClosedGrantPage(jwt: string, req: NextRequest) {
  const { pathname } = req.nextUrl;
  const id = pathname.split('/')[2];

  if (pathname.includes('summary')) return;
  if (!id) return;

  const applicationStatus = await getApplicationStatusBySubmissionId(
    id,
    jwt,
    pathname
  );

  const isSubmissionSubmitted = await getIsSubmissionSubmitted(id, jwt);

  if (applicationStatus === 'REMOVED' && !isSubmissionSubmitted) {
    return NextResponse.redirect(process.env.HOST + GRANT_CLOSED_REDIRECT);
  }
}

const authenticateRequest = async (req: NextRequest, res: NextResponse) => {
  if (patterns.signInDetails.test({ pathname: req.nextUrl.pathname })) {
    if (!ONE_LOGIN_ENABLED) {
      const url = req.nextUrl.clone();
      url.pathname = '/404';
      return NextResponse.redirect(url);
    } else {
      return NextResponse.next();
    }
  }

  const jwt = await getJwtFromMiddlewareCookies(req);

  if (patterns.submissionJourney.test({ pathname: req.nextUrl.pathname })) {
    const shouldRedirect = await shouldRedirectToClosedGrantPage(jwt, req);
    if (shouldRedirect) {
      return shouldRedirect;
    }
  }

  if (
    patterns.mandatoryQuestionsJourney.test({ pathname: req.nextUrl.pathname })
  ) {
    //hasInternalApplication check that the advert has the "apply" url set to a internal application
    const { hasInternalApplication, hasPublishedInternalApplication } =
      await getMandatoryQuestionApplicationInfos(req, jwt);

    if (hasInternalApplication && !hasPublishedInternalApplication) {
      return NextResponse.redirect(process.env.HOST + GRANT_CLOSED_REDIRECT);
    }
  }

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
      }?${encodeURIComponent(req.nextUrl.searchParams.toString())}`
    );
  }
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

const getConditionalLogger = (req, type: LoggerType) => {
  const userAgentHeader = req.headers.get('user-agent') || '';
  const shouldSkipLogging =
    userAgentHeader.startsWith('ELB-HealthChecker') ||
    urlsToSkip.some((url) => req.nextUrl.pathname.startsWith(url));
  return shouldSkipLogging ? () => undefined : httpLoggers[type];
};

const authenticatedPaths = [
  '/applications/:path*',
  '/dashboard/:path*',
  '/organisation/:path*',
  '/personal-details/:path*',
  '/submissions/:path*',
  '/grant-is-closed',
  '/sign-in-details',
  '/api/redirect-from-find',
  '/mandatory-questions/:path*',
].map((pathname) => new URLPattern({ pathname }));

const isAuthenticatedPath = (pathname: string) =>
  authenticatedPaths.some((authenticatedPath) =>
    authenticatedPath.test({ pathname })
  );

export const middleware = async (req: NextRequest) => {
  const logRequest = getConditionalLogger(req, 'req');
  const logResponse = getConditionalLogger(req, 'res');
  let res = NextResponse.next();
  logRequest(req, res);

  if (isAuthenticatedPath(req.nextUrl.pathname)) {
    try {
      res = await authenticateRequest(req, res);
      await csrfMiddleware(req, res);
    } catch (err) {
      logger.error('Middleware failure', logger.utils.addErrorInfo(err, req));
      // redirect to homepage on any middleware error
      res = buildMiddlewareResponse(req, HOST);
    }
  }

  logResponse(req, res);
  return res;
};
