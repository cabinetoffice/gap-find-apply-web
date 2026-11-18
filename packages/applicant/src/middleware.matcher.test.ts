/**
 * @jest-environment node
 */
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config } from './middleware.page';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextConfig = require('../next.config');

jest.mock('./utils/csrfMiddleware');
jest.mock('./services/JwtService');
// Use the same URLPattern polyfill as the jsdom tests. Node's built-in
// URLPattern rejects some of the patterns the middleware defines.
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  URLPattern: jest.requireActual('urlpattern-polyfill/urlpattern').URLPattern,
}));

describe('Middleware matcher', () => {
  const { basePath, i18n } = nextConfig;
  const submissionPath =
    '/submissions/a8d5e0f1-8c2b-4c1e-9f5a-1b2c3d4e5f60/sections/CUSTOM_SECTION/questions/b7c6d5e4-3f2a-4b1c-8d9e-0f1a2b3c4d5e';
  const uploadFilePath = `/api/routes${submissionPath}/upload-file`;

  const runsMiddleware = (url: string) =>
    unstable_doesMiddlewareMatch({
      config,
      nextConfig: { basePath, i18n },
      url,
    });

  // Before matching, Next.js adds the default locale after the basePath, so
  // the matcher sees /apply/applicant/en/... for every page and API route.
  const runsMiddlewareOnPath = (path: string) =>
    runsMiddleware(`http://localhost${basePath}/${i18n.defaultLocale}${path}`);

  it('skips the document upload route so large uploads are not cut off', () => {
    expect(runsMiddlewareOnPath(uploadFilePath)).toBe(false);
    expect(runsMiddlewareOnPath(`${uploadFilePath}?fromCYAPage=true`)).toBe(
      false
    );
  });

  it.each([
    ['the root', ''],
    ['the dashboard', '/dashboard'],
    ['a question page', submissionPath],
    ['the mandatory questions start page', '/mandatory-questions/start'],
    ['the redirect from Find', '/api/redirect-from-find'],
    [
      'the remove attachment route',
      `/api/routes${submissionPath}/attachments/c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f/remove`,
    ],
  ])('still runs on %s', (_, path) => {
    expect(runsMiddlewareOnPath(path)).toBe(true);
  });

  it('still runs on client-side page navigations', () => {
    expect(
      runsMiddleware(
        `http://localhost${basePath}/_next/data/build-id/${i18n.defaultLocale}/dashboard.json`
      )
    ).toBe(true);
  });
});
