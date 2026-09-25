import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import ServiceErrorPage, { getServerSideProps } from './index.page';

// HackerOne reflected XSS via serviceErrorProps.linkAttributes.href.
// The admin page renders the link through CustomLink, which prefixes
// SUB_PATH. The researcher's bypass was excludeSubPath=true, read straight
// off the query string, which turned that prefixing off and let a raw
// javascript: URL through. The fix validates the href server-side and
// retires excludeSubPath, so the page now always emits a SUB_PATH-prefixed,
// same-origin path — hence the '/apply/admin' prefix in the expectations.

jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {},
  publicRuntimeConfig: { SUB_PATH: '/apply/admin' },
}));

const FALLBACK = '/apply/admin/dashboard';

const renderForHref = async (href: string) => {
  const res = (await getServerSideProps({
    query: {
      serviceErrorProps: JSON.stringify({
        errorInformation: 'test',
        linkAttributes: { href, linkText: 'click', linkInformation: '' },
      }),
      // the researcher's now-retired bypass; passing it must have no effect
      excludeSubPath: 'true',
    },
  } as unknown as GetServerSidePropsContext)) as {
    props: { serviceError: unknown };
  };

  render(<ServiceErrorPage serviceError={res.props.serviceError as never} />);

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
  ])(
    'neutralises %s even when excludeSubPath=true is supplied',
    async (_label, payload) => {
      const href = await renderForHref(payload);

      expect(href).toBe(FALLBACK);
      expect(href).not.toContain(payload);
      expect(href?.toLowerCase()).not.toContain('javascript:');
    }
  );

  it('passes a genuine relative path through, prefixed with SUB_PATH', async () => {
    expect(await renderForHref('/scheme/1234')).toBe('/apply/admin/scheme/1234');
  });

  it('does not error (500) on malformed serviceErrorProps', async () => {
    await expect(
      getServerSideProps({
        query: { serviceErrorProps: 'not-json' },
      } as unknown as GetServerSidePropsContext)
    ).resolves.toBeDefined();
  });
});
