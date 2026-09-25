import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import ServiceErrorPage, { getServerSideProps } from './index.page';

// HackerOne reflected XSS via serviceErrorProps.linkAttributes.href.
// The admin page renders the link through CustomLink, which normally
// prefixes SUB_PATH (accidentally defusing javascript:). The researcher's
// bypass is excludeSubPath=true, read straight off the query string, which
// turns that prefixing off. These tests exercise that bypass path: they
// fail on the current code and should pass once the href is validated.

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {},
  publicRuntimeConfig: { SUB_PATH: '/apply/admin' },
}));

const FALLBACK = '/dashboard';

const renderForHref = async (href: string) => {
  const res = (await getServerSideProps({
    query: {
      serviceErrorProps: JSON.stringify({
        errorInformation: 'test',
        linkAttributes: { href, linkText: 'click', linkInformation: '' },
      }),
      // the researcher's bypass: skip CustomLink's SUB_PATH prefixing
      excludeSubPath: 'true',
    },
  } as unknown as GetServerSidePropsContext)) as {
    props: { serviceError: unknown; excludeSubPath: boolean };
  };

  render(<ServiceErrorPage {...(res.props as never)} />);

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
  ])('neutralises %s even with excludeSubPath=true', async (_label, payload) => {
    const href = await renderForHref(payload);

    expect(href).toBe(FALLBACK);
    expect(href).not.toBe(payload);
    expect(href?.toLowerCase()).not.toContain('javascript:');
  });

  it('passes a genuine relative path through unchanged', async () => {
    // excludeSubPath=true means CustomLink emits the path as-is
    expect(await renderForHref('/scheme/1234')).toBe('/scheme/1234');
  });

  it('does not error (500) on malformed serviceErrorProps', async () => {
    await expect(
      getServerSideProps({
        query: { serviceErrorProps: 'not-json' },
      } as unknown as GetServerSidePropsContext)
    ).resolves.toBeDefined();
  });
});
