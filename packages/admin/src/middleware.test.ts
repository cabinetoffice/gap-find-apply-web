import { middleware } from './middleware.page';
// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';

describe('middleware', () => {
  const req = new NextRequest('http://localhost:3000/apply/test/destination');

  beforeEach(() => {
    process.env.MAX_COOKIE_AGE = '21600';
    process.env.LOGIN_URL = 'http://localhost:8082/login';
  });

  it('Should redirect to the logout page when the user is not authorized', () => {
    const result = middleware(req);

    expect(result).toBeInstanceOf(NextResponse);

    // basePath from nextjs config does not apply to jest tests, thus no subpaths
    expect(result.headers.get('Location')).toStrictEqual(
      'http://localhost:8082/login'
    );
  });

  it('Should reset auth cookie correctly when the user is authorised', () => {
    // Just set any expiry. If response expiry is different, cookie was updated
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    const reqCookie = req.cookies.getWithOptions('session_id');

    const result = middleware(req);

    const cookieOptions = result.cookies.getWithOptions('session_id').options;
    expect(result.cookies.get('session_id')).toStrictEqual('session_id_value');
    expect(cookieOptions.Path).toStrictEqual('/');
    expect(cookieOptions.SameSite).toStrictEqual('Lax');
    expect(cookieOptions['Max-Age']).toStrictEqual('21600');
    expect(cookieOptions.Expires).not.toStrictEqual(reqCookie.options.Expires);
  });

  it('Should redirect to the original requests URL when we are authorised', () => {
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    const result = middleware(req);

    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/test/destination'
    );
  });
});

describe('middleware', () => {
  const req = new NextRequest(
    'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
  );

  it('Should allow the user to access the advert builder pages if the feature is enabled', () => {
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    process.env.FEATURE_ADVERT_BUILDER = 'enabled';
    const result = middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('x-middleware-rewrite')).toStrictEqual(
      'http://localhost:3000/apply/admin/scheme/1/advert/129744d5-0746-403f-8a5f-a8c9558bc4e3/grantDetails/1'
    );
  });

  it('Should not allow the user to access the advert builder pages if the feature is enabled', () => {
    req.cookies.set('session_id', 'session_id_value', { maxAge: 60 });
    process.env.FEATURE_ADVERT_BUILDER = 'disabled';
    const result = middleware(req);

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.headers.get('location')).toStrictEqual(
      'http://localhost:3000/404'
    );
  });
});
