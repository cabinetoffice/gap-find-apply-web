import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../testUtils/createMockRouter';
import ServiceErrorPage, { getServerSideProps } from './index.page';

// HackerOne reflected XSS via serviceErrorProps.linkAttributes.href.
// The applicant page renders the link with next/link, which emits the
// destination verbatim, so a single query parameter is enough to reach
// the DOM. These tests fail on the current code and should pass once the
// href is validated in getServerSideProps.

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: { backendHost: 'http://localhost:8080', subPath: '' },
  publicRuntimeConfig: { subPath: '' },
}));

const FALLBACK = '/dashboard';

const renderForHref = async (href: string) => {
  const res = (await getServerSideProps({
    query: {
      serviceErrorProps: JSON.stringify({
        errorInformation: 'test',
        linkAttributes: { href, linkText: 'click', linkInformation: '' },
      }),
    },
  } as unknown as GetServerSidePropsContext)) as { props: { serviceError: unknown } };

  render(
    <RouterContext.Provider value={createMockRouter({})}>
      <ServiceErrorPage serviceError={res.props.serviceError as never} />
    </RouterContext.Provider>
  );

  return screen.getByRole('link', { name: 'click' }).getAttribute('href');
};

describe('service-error link destination is not attacker-controlled', () => {
  it.each([
    ['javascript: scheme', 'javascript:alert(document.domain)'],
    ['mixed-case scheme', 'JaVaScRiPt:alert(1)'],
    ['protocol-relative //', '//evil.example/phish'],
    ['protocol-relative /\\', '/\\evil.example'],
    ['absolute https URL', 'https://evil.example/phish'],
    ['data URL', 'data:text/html,<script>alert(1)</script>'],
  ])('neutralises %s', async (_label, payload) => {
    const href = await renderForHref(payload);

    expect(href).toBe(FALLBACK);
    expect(href).not.toBe(payload);
    expect(href?.toLowerCase()).not.toContain('javascript:');
  });

  it('passes a genuine relative path through unchanged', async () => {
    expect(await renderForHref('/applications')).toBe('/applications');
  });

  it('does not error (500) on malformed serviceErrorProps', async () => {
    await expect(
      getServerSideProps({
        query: { serviceErrorProps: 'not-json' },
      } as unknown as GetServerSidePropsContext)
    ).resolves.toBeDefined();
  });
});
