// eslint-disable-next-line  @next/next/no-server-import-in-page
import { NextRequest, NextResponse } from 'next/server';
import { getLoginUrl } from './utils/general';
import { isAdminSessionValid } from './services/UserService';

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
      const isValidAdminSession = await isAdminSessionValid(auth_cookie);
      if (!isValidAdminSession) {
        return NextResponse.redirect(
          getLoginUrl({ redirectToApplicant: true })
        );
      }
    }

    res.cookies.set('session_id', auth_cookie, {
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
}
