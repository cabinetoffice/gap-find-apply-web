import '@testing-library/jest-dom';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware.page';
import { isAdminSessionValid } from './services/UserService';
import { getLoginUrl, parseJwt } from './utils/general';

jest.mock('./utils/csrfMiddleware');

jest.mock('./utils/general');
jest.mock('./services/UserService', () => ({
  isAdminSessionValid: jest.fn(),
}));

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  URLPattern: jest.fn().mockImplementation(() => ({
    test: jest.fn(),
  })),
}));

const mockedGetLoginUrl = jest.mocked(getLoginUrl);
const mockedParseJwt = jest.mocked(parseJwt);
const mockedIsAdminSessionValid = jest.mocked(isAdminSessionValid);

const loginUrl = 'http://localhost:8082/login';

describe('middleware', () => {
  const req = new NextRequest(
    'http://localhost:3000/apply/test/destination?scheme=1&grant=2'
  );

  beforeEach(() => {
    process.env.MAX_COOKIE_AGE = '21600';
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGIN_URL = 'http://localhost:8082/login';
    process.env.V2_LOGIN_URL = 'http://localhost:8082/login';
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE = 'true';
    process.env.JWT_COOKIE_NAME = 'user-service-token';
    process.env.HOST = 'http://localhost:3003';
    process.env.REFRESH_URL = 'http://localhost:8082/refresh';
  });

  it('Redirect to the login page when the user is not authorized', async () => {
    mockedGetLoginUrl.mockReturnValue(loginUrl);
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    // basePath from nextjs config does not apply to jest tests, thus no subpaths
    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Redirect to the login page when the admin session is invalid', async () => {
    req.cookies.set('session_id', 'session_id_value');
    req.cookies.set('user-service-token', 'user-service-value');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expiring in 1 hour

    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });
    mockedIsAdminSessionValid.mockImplementation(async () => false);
    mockedGetLoginUrl.mockReturnValue(loginUrl);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Redirect to the login page with an undefined user-service jwt', async () => {
    req.cookies.clear();
    req.cookies.set('session_id', 'session_id_value');
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    mockedGetLoginUrl.mockReturnValue(loginUrl);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    expect(result.headers.get('Location')).toStrictEqual(loginUrl);
  });

  it('Should set auth cookie correctly when the user is authorised', async () => {
    mockedParseJwt.mockReturnValue({
      exp: 1000000000,
    });
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    mockedGetLoginUrl.mockReturnValue(loginUrl);
    req.cookies.set('session_id', 'session_id_value');
    req.cookies.set('user-service-token', 'user-service-value');

    const result = await middleware(req);

    const resCookie = result.cookies.get('session_id') as ResponseCookie;

    expect(resCookie.value).toStrictEqual('session_id_value');
    expect(resCookie.path).toStrictEqual('/');
    expect(resCookie.sameSite).toStrictEqual('lax');
    expect(resCookie.maxAge).toStrictEqual(21600);
  });

  it('Should redirect to the original requests URL when we are authorised', async () => {
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    req.cookies.set('user-service-token', 'user_service_token_value');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expiring in 1 hour

    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });
    const result = await middleware(req);

    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/test/destination?scheme=1&grant=2'
    );
  });

  it('Redirects to refresh URL if JWT is close to expiration', async () => {
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    req.cookies.set('user-service-token', 'user_service_token_value');

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes

    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `http://localhost:8082/refresh?redirectUrl=http://localhost:3003/apply/test/destination?scheme%3D1%26grant%3D2`
    );
  });
});

describe('advert builder middleware', () => {
  const req = new NextRequest(
    'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
  );

  it('Should allow the user to access the advert builder pages if the feature is enabled', async () => {
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    req.cookies.set('user-service-token', 'user_service_token_value');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expiring in 1 hour

    mockedParseJwt.mockReturnValue({
      exp: expiresAt.getTime() / 1000,
    });

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
    );
  });

  it('Should not allow the user to access the advert builder pages if the feature is enabled', async () => {
    mockedIsAdminSessionValid.mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    process.env.FEATURE_ADVERT_BUILDER = 'disabled';
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('location')).toStrictEqual(
      'http://localhost:3000/404'
    );
  });
});
