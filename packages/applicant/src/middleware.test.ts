import { middleware, buildMiddlewareResponse } from './middleware.page';
// eslint-disable-next-line @next/next/no-server-import-in-page
import { NextRequest } from 'next/server';
import { verifyToken } from './services/JwtService';

jest.mock('./services/JwtService');

const mockedVerifyToken = jest.mocked(verifyToken);

describe('Middleware', () => {
  beforeEach(jest.clearAllMocks);

  it('redirects to host if no JWT in cookies ', async () => {
    const req = new NextRequest(new Request('https://www.website.com/page'));
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(process.env.HOST);
  });

  it('redirects to host if JWT is not valid', async () => {
    mockedVerifyToken.mockResolvedValueOnce({ valid: false });

    const req = new NextRequest(new Request('https://some.website.com/page'));
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

    const req = new NextRequest(
      new Request('https://some.website.com/test?scheme=1')
    );
    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const res = await middleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.REFRESH_URL}?redirectUrl=${process.env.HOST}/test?scheme=1`
    );
  });

  it('sets application redirect cookie if URL matches new application pattern', async () => {
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

  it('sets find redirect cookie if URL matches find redirect pattern and FF enabled', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'true';
    const slug = 'slug-123';
    const pathname = 'api/redirect-from-find?slug=' + slug;

    const req = new NextRequest(
      new Request(`https://some.website.com/${pathname}`)
    );
    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.get(process.env.FIND_REDIRECT_COOKIE)).toEqual(
      `?slug=${slug}`
    );
    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });

  it('does not set find redirect cookie if URL matches find redirect pattern but FF disabled', async () => {
    const mandatoryQuestionsEnabledBackup =
      process.env.MANDATORY_QUESTIONS_ENABLED;
    process.env.MANDATORY_QUESTIONS_ENABLED = 'false';
    const slug = 'slug-123';
    const pathname = 'api/redirect-from-find?slug=' + slug;

    const req = new NextRequest(
      new Request(`https://some.website.com/${pathname}`)
    );
    const res = buildMiddlewareResponse(req, process.env.HOST);

    expect(res.cookies.get(process.env.FIND_REDIRECT_COOKIE)).toEqual(
      undefined
    );
    process.env.MANDATORY_QUESTIONS_ENABLED = mandatoryQuestionsEnabledBackup;
  });

  it('redirect to grant-is-closed if it gets a removed response from the API', async () => {
    const req = new NextRequest(
      new Request('https://some.website.com/submissions/some-uuid')
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue('REMOVED'),
    } as unknown as Response);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('redirect to grant-is-closed if it gets a removed response from the API for mandatory questions', async () => {
    const req = new NextRequest(
      new Request('https://some.website.com/mandatory-questions/000/some-url')
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    jest.spyOn(global, 'fetch').mockResolvedValue({
      text: jest.fn().mockResolvedValue('REMOVED'),
    } as unknown as Response);
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(
      `${process.env.HOST}/grant-is-closed`
    );
  });

  it('does not redirect to grant is closed if mandatory questions start page', async () => {
    const req = new NextRequest(
      new Request(
        'https://some.website.com/mandatory-questions/start?=someuuid'
      )
    );

    req.cookies.set(process.env.USER_TOKEN_NAME, 'valid');
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe(`${process.env.HOST}`);
  });
});
