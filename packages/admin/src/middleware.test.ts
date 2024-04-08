import '@testing-library/jest-dom';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { NextURL } from 'next/dist/server/web/next-url';
import { middleware } from './middleware.page';
import { isAdminSessionValid } from './services/UserService';
import { getLoginUrl, parseJwt } from './utils/general';

jest.mock('./utils/csrfMiddleware');

jest.mock('./utils/general');
jest.mock('./services/UserService', () => ({
  isAdminSessionValid: jest.fn(),
}));

let cookieStore = {},
  headerStore = {};

const getMockRequest = (url: string) =>
  ({
    cookies: {
      get: (key) => cookieStore[key],
      getAll: () =>
        Object.entries(cookieStore).map(([name, value]) => ({ name, value })),
      set: (name, value) => (cookieStore[name] = { name, value }),
    },
    headers: {
      get: (key) => headerStore[key],
      entries: () => [],
      set: (key, value) => (headerStore[key] = value),
    },
    setUrl(url) {
      this.nextUrl = new NextURL(url);
    },
    url,
    nextUrl: new NextURL(url),
    method: 'GET',
  } as unknown as NextRequest & { setUrl: (string) => string });

const mockedGetLoginUrl = jest.mocked(getLoginUrl);
const mockedParseJwt = jest.mocked(parseJwt);
const mockedIsAdminSessionValid = jest.mocked(isAdminSessionValid);

const loginUrl = 'http://localhost:8082/login';
const expiresAt = new Date();
expiresAt.setHours(expiresAt.getHours() + 1); // Expiring in 1 hour

describe('middleware', () => {
  const req = getMockRequest('http://localhost:3000/dashboard');

  beforeEach(() => {
    process.env.MAX_COOKIE_AGE = '21600';
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGIN_URL = loginUrl;
    process.env.V2_LOGIN_URL = loginUrl;
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE = 'true';

    process.env.JWT_COOKIE_NAME = 'user-service-token';
    process.env.HOST = 'http://localhost:3003';
    process.env.REFRESH_URL = 'http://localhost:8082/refresh';

    cookieStore = {};
    headerStore = {};

    req.cookies.set('session_id', 'session_id_value');
    req.cookies.set('user-service-token', 'user-service-value');

    jest.clearAllMocks();
    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    mockedGetLoginUrl.mockReturnValue(loginUrl);
  });

  it('Redirect to the login page when there is no authCookie', async () => {
    req.cookies.clear();
    req.cookies.set('user-service-token', 'user-service-value');

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Redirect to the login page when there is no jwt', async () => {
    req.cookies.clear();
    req.cookies.set('session_id', 'session_id_value');

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Should redirect with a redirectUrl when user not authorised AND path is submissionExport', async () => {
    req.cookies.clear();

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('Location')).toBe(
      `${loginUrl}?redirectUrl=http://localhost:3003/dashboard`
    );
  });

  it('Redirect to the login page when the admin session is invalid', async () => {
    mockedIsAdminSessionValid.mockResolvedValue(false);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Redirects to login url if jwt has expired', async () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() - 10); // Expired 10 minutes ago
    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${loginUrl}?redirectUrl=http://localhost:3000/dashboard`
    );
  });

  it('Redirects to refresh URL if JWT is close to expiration', async () => {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes
    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });

    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `http://localhost:8082/refresh?redirectUrl=http://localhost:3003/dashboard`
    );
  });

  describe('Ad builder middleware', () => {
    const adBuilderReq = new NextRequest(
      'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
    );

    beforeEach(() => {
      adBuilderReq.cookies.clear();
      adBuilderReq.cookies.set('session_id', 'session_id_value');
      adBuilderReq.cookies.set('user-service-token', 'user-service-value');
    });

    it('Should allow the user to access the advert builder pages if the feature is enabled', async () => {
      process.env.FEATURE_ADVERT_BUILDER = 'enabled';

      const result = await middleware(adBuilderReq);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
        'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
      );
    });

    it('Should not allow the user to access the advert builder pages if the feature is enabled', async () => {
      process.env.FEATURE_ADVERT_BUILDER = 'disabled';

      const result = await middleware(adBuilderReq);

      expect(result).toBeInstanceOf(NextResponse);
      expect(result.headers.get('location')).toStrictEqual(
        'http://localhost:3000/404'
      );
    });
  });

  it('Should set auth cookie correctly when the user is authorised', async () => {
    const result = await middleware(req);
    const resCookie = result.cookies.get('session_id') as ResponseCookie;

    expect(resCookie.value).toStrictEqual('session_id_value');
    expect(resCookie.path).toStrictEqual('/');
    expect(resCookie.sameSite).toStrictEqual('lax');
    expect(resCookie.maxAge).toStrictEqual(21600);
  });

  it('Should redirect to the original requests URL when we are authorised', async () => {
    const result = await middleware(req);

    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/dashboard'
    );
  });
});
