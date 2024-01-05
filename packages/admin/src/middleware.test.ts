/**
 * @jest-environment node
 */
// The above was added so that jest know it's not web. Throws a type error otherwise.
import '@testing-library/jest-dom';
import { middleware } from './middleware.page';
// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { isAdminSessionValid } from './services/UserService';
import { getLoginUrl } from './utils/general';

jest.mock('./utils/general');
jest.mock('./services/UserService', () => ({
  isAdminSessionValid: jest.fn(),
}));

describe('middleware', () => {
  const req = new NextRequest('http://localhost:3000/apply/test/destination');

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

  it('Should redirect to the applicant dashboard page when the user is not authorized', async () => {
    const expectedUrl = 'http://localhost:3000/apply/applicant/dashboard';
    req.cookies.set('user-service-token', 'user-service-token-value');
    (getLoginUrl as jest.Mock).mockReturnValue(expectedUrl);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(getLoginUrl).toBeCalledWith({ redirectToApplicant: true });
    expect(result.headers.get('Location')).toStrictEqual(expectedUrl);
  });

  it('should redirect to the logout page when the admin session is invalid', async () => {
    const expectedUrl = 'http://localhost:8082/login';
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => false);
    (getLoginUrl as jest.Mock).mockReturnValue(expectedUrl);

    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    expect(result.headers.get('Location')).toStrictEqual(expectedUrl);
  });

  it('Should reset auth cookie correctly when the user is authorised', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    // Just set any expiry. If response expiry is different, cookie was updated
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    const reqCookie = req.cookies.getWithOptions('session_id');

    const result = await middleware(req);

    const cookieOptions = result.cookies.getWithOptions('session_id').options;
    expect(result.cookies.get('session_id')).toStrictEqual('session_id_value');
    expect(cookieOptions.Path).toStrictEqual('/');
    expect(cookieOptions.SameSite).toStrictEqual('Lax');
    expect(cookieOptions['Max-Age']).toStrictEqual('21600');
    expect(cookieOptions.Expires).not.toStrictEqual(reqCookie.options.Expires);
  });

  it('Should redirect to the original requests URL when we are authorised', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
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
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
    );
  });

  it('Should not allow the user to access the advert builder pages if the feature is enabled', async () => {
    (isAdminSessionValid as jest.Mock).mockImplementation(async () => true);
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    process.env.FEATURE_ADVERT_BUILDER = 'disabled';
    const result = await middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('location')).toStrictEqual(
      'http://localhost:3000/404'
    );
  });
});
