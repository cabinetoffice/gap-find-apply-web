import { NextFetchEvent, NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// It will apply the middleware to all those paths
// (if new folders at page root are created, they need to be included here)
export const config = {
  matcher: [
    '/build-application/:path*',
    '/dashboard/:path*',
    '/new-scheme/:path*',
    '/scheme/:path*',
    '/scheme-list/:path*',
  ],
};

export function middleware(req: NextRequest, ev: NextFetchEvent) {
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
    const url = req.nextUrl.clone();
    url.pathname = `/api/logout`;

    return NextResponse.rewrite(url);
  }
}
