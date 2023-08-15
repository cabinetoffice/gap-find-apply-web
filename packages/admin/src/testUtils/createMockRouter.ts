import { NextRouter } from 'next/router';

export function createMockRouter(
  overrides: Partial<NextRouter> = {}
): NextRouter {
  return {
    basePath: '',
    pathname: '/',
    route: '',
    query: {},
    asPath: '/',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    push: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      ...overrides.events,
    },
    isFallback: false,
    isLocaleDomain: false,
    isReady: true,
    defaultLocale: 'en',
    domainLocales: [],
    isPreview: false,
    ...overrides,
  };
}
