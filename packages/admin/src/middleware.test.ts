import '@testing-library/jest-dom';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware.page';
import { isAdminSessionValid } from './services/UserService';
import { getLoginUrl } from './utils/general';

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

describe('middleware', () => {
  const req = new NextRequest('http://localhost:3000/dashboard');

  beforeEach(() => {
    process.env.MAX_COOKIE_AGE = '21600';
    process.env.ONE_LOGIN_ENABLED = 'false';
    process.env.LOGIN_URL = 'http://localhost:8082/login';
    process.env.V2_LOGIN_URL = 'http://localhost:8082/login';
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    process.env.VALIDATE_USER_ROLES_IN_MIDDLEWARE = 'true';
  });

  it('Should redirect to the logout page when the user is not authorized', async () => {
    const expectedUrl = 'http://localhost:8082/login';
    (getLoginUrl as jest.Mock).mockReturnValue(expectedUrl);
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    // basePath from nextjs config does not apply to jest tests, thus no subpaths
    expect(result.headers.get('Location')).toStrictEqual(expectedUrl);
  });

  it('should redirect to the logout page when the admin session is invalid', async () => {
    const expectedUrl = 'http://localhost:8082/login';
    req.cookies.set('session_id', 'session_id_value');
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => false);
    (getLoginUrl as jest.Mock).mockReturnValue(expectedUrl);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    expect(result.headers.get('Location')).toStrictEqual(expectedUrl);
  });

  it('Should reset auth cookie correctly when the user is authorised', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);

    req.cookies.set('session_id', 'session_id_value');

    const result = await middleware(req);

    const resCookie = result.cookies.get('session_id') as ResponseCookie;

    expect(resCookie.value).toStrictEqual('session_id_value');
    expect(resCookie.path).toStrictEqual('/');
    expect(resCookie.sameSite).toStrictEqual('lax');
    expect(resCookie.maxAge).toStrictEqual(21600);
  });

  it('Should redirect to the original requests URL when we are authorised', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    const result = await middleware(req);

    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/test/destination'
    );
  });
});

describe('middleware', () => {
  const req = new NextRequest(
    'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
  );

  it('Should allow the user to access the advert builder pages if the feature is enabled', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
    );
  });

  it('Should not allow the user to access the advert builder pages if the feature is enabled', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value');
    process.env.FEATURE_ADVERT_BUILDER = 'disabled';
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('location')).toStrictEqual(
      'http://localhost:3000/404'
    );
  });
});
