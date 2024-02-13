import { middleware, buildMiddlewareResponse } from './middleware.page';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { verifyToken } from './services/JwtService';
import { NextURL } from 'next/dist/server/web/next-url';

// relies on running in edge env
jest.mock('./utils/csrfMiddleware');
jest.mock('./services/JwtService');
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    next: jest.fn(() => ({ cookies: { set: jest.fn() } })),
    redirect: jest.fn((url) => ({
      cookies: { set: jest.fn() },
      headers: { get: () => url },
      status: 307,
    })),
  },
}));

const mockedVerifyToken = jest.mocked(verifyToken);

let cookieStore = {},
  headerStore = {};

const getMockRequest = (url: string) =>
  ({
    cookies: {
      get: (key) => cookieStore[key],
      getAll: () =>
        Object.entries(cookieStore).map(([name, value]) => ({ [name]: value })),
      set: (key, value) => (cookieStore[key] = { key, value }),
    },
    headers: {
      get: (key) => headerStore[key],
      set: (key, value) => (headerStore[key] = value),
    },
    url,
    nextUrl: new NextURL(url),
    method: 'GET',
  } as unknown as NextRequest);

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cookieStore = {};
    headerStore = {};
  });

  it('redirects to host if no JWT in cookies ', async () => {
    const req = getMockRequest('https://www.website.com/page');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(process.env.HOST);
  });

  it('redirects to host if JWT is not valid', async () => {
    mockedVerifyToken.mockResolvedValueOnce({ valid: false });

    const req = getMockRequest('https://some.website.com/page');
    req.cookies.set(process.env.USER_TOKEN_NAME, 'invalid');

    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(process.env.HOST);
  });

  it('redirects to refresh URL if JWT is close to expiration', async () => {
    process.env.REFRESH_URL = 'http://localhost:8082/refresh-token';
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes

    mockedVerifyToken.mockResolvedValueOnce({
      valid: true,
      expiresAt: expiresAt.toISOString(),
    });

    const req = getMockRequest('https://some.website.com/test?scheme=1');

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}/test?scheme=1`
    );
  });

  const cookieSettings = {
    httpOnly: true,
    maxAge: 900,
    path: '/',
    secure: true,
  };

  it('sets application redirect cookie if URL matches new application pattern', async () => {
    const pathname = 'applications/123';
    const applicationId = '123';

    const req = getMockRequest(`https://some.website.com/${pathname}`);

    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.set).toHaveBeenCalledWith(
      process.env.APPLYING_FOR_REDIRECT_COOKIE,
      applicationId,
      cookieSettings
    );
  });

  it('sets find redirect cookie if URL matches find redirect pattern and FF enabled', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'true';
    const slug = 'slug-123';
    const pathname = 'api/redirect-from-find?slug=' + slug;

    const req = getMockRequest(`https://some.website.com/${pathname}`);

    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.set).toHaveBeenCalledWith(
      process.env.FIND_REDIRECT_COOKIE,
      `?slug=${slug}`,
      cookieSettings
    );
    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });

  it('does not set find redirect cookie if URL matches find redirect pattern but FF disabled', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'false';
    const slug = 'slug-123';
    const pathname = 'api/redirect-from-find?slug=' + slug;

    const req = getMockRequest(`https://some.website.com/${pathname}`);

    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.set).not.toHaveBeenCalled();

    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });

  it('redirect to grant-is-closed if it gets a removed response from the API and submission is not submitted', async () => {
    const req = getMockRequest(
      'https://some.website.com/submissions/some-uuid'
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const mapUrlToResponse = {
      'undefined/submissions/some-uuid/application/status': 'REMOVED',
      'undefined/submissions/some-uuid/isSubmitted': 'false',
    };
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      return {
        text: jest.fn().mockResolvedValue(mapUrlToResponse[url as string]),
      } as unknown as Promise<Response>;
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('should not redirect to grant-is-closed if it gets a removed response from the API but submission is submitted', async () => {
    const req = getMockRequest(
      'https://some.website.com/submissions/some-uuid'
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');

    const mapUrlToResponse = {
      'undefined/submissions/some-uuid/application/status': 'REMOVED',
      'undefined/submissions/some-uuid/isSubmitted': 'true',
    };
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      return {
        text: jest.fn().mockResolvedValue(mapUrlToResponse[url as string]),
      } as unknown as Promise<Response>;
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).not.toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('redirect to grant-is-closed if it gets a removed response from the API for mandatory questions and submission is not submitted', async () => {
    const req = getMockRequest(
      'https://some.website.com/mandatory-questions/000/some-url'
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const mapUrlToResponse = {
      'undefined/grant-mandatory-questions/000/application/status': 'REMOVED',
      'undefined/submissions/000/isSubmitted': 'false',
    };
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      return {
        text: jest.fn().mockResolvedValue(mapUrlToResponse[url as string]),
      } as unknown as Promise<Response>;
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('should not redirect to grant-is-closed if it gets a removed response from the API for mandatory questions but submission is submitted', async () => {
    const req = getMockRequest(
      'https://some.website.com/mandatory-questions/000/some-url'
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const mapUrlToResponse = {
      'undefined/grant-mandatory-questions/000/application/status': 'REMOVED',
      'undefined/submissions/000/isSubmitted': 'true',
    };
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      return {
        text: jest.fn().mockResolvedValue(mapUrlToResponse[url as string]),
      } as unknown as Promise<Response>;
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).not.toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('does not redirect to grant is closed if mandatory questions start page', async () => {
    const req = getMockRequest(
      'https://some.website.com/mandatory-questions/start?=someuuid'
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.HOST}?redirectUrl=http://localhost:3000/apply/applicant/mandatory-questions/start?=someuuid`
    );
  });
});
