import { middleware, buildMiddlewareResponse } from './middleware.page';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { verifyToken } from './services/JwtService';

jest.mock('./services/JwtService');

global.fetch = jest.fn();
const mockedFetch = jest.mocked(global.fetch);
const mockedVerifyToken = jest.mocked(verifyToken);

describe('Middleware', () => {
  beforeEach(jest.clearAllMocks);

  it('redirects to host if response is not OK or JWT is undefined', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      text: jest.fn().mockResolvedValueOnce('undefined'),
    } as unknown as Response);

    const req = new NextRequest(new Request('https://some.website.com/page'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(process.env.HOST);
  });

  it('redirects to host if JWT is not valid', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce('someJwt'),
    } as unknown as Response);

    mockedVerifyToken.mockResolvedValueOnce({ valid: false });

    const req = new NextRequest(new Request('https://some.website.com/page'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(process.env.HOST);
  });

  it('redirects to refresh URL if JWT is close to expiration', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce('someJwt'),
    } as unknown as Response);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expiring in 10 minutes

    mockedVerifyToken.mockResolvedValueOnce({
      valid: true,
      expiresAt: expiresAt.toISOString(),
    });

    const req = new NextRequest(new Request('https://some.website.com/test'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}/test`
    );
  });

  it('sets redirect cookie if URL matches new application pattern', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValueOnce('someJwt'),
    } as unknown as Response);
    const pathname = 'applications/123';
    const applicationId = '123';

    const req = new NextRequest(
      new Request(`https://some.website.com/${pathname}`)
    );
    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.get(process.env.APPLYING_FOR_REDIRECT_COOKIE)).toEqual(
      applicationId
    );
  });
});
