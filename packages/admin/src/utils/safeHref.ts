// Guard for user-supplied link destinations that are rendered into an
// <a href> on the service-error page. The href arrives inside the
// serviceErrorProps query parameter, so it is fully attacker-controlled
// and must never reach the DOM unchecked (reflected XSS, HackerOne).
//
// A legitimate destination is always a path within this app, e.g.
// "/dashboard" or "/applications". Anything else is rejected and replaced
// with a safe default rather than sanitised: a "javascript:"/"data:"
// scheme, a protocol-relative "//host" or "/\host", or an absolute URL.

export const FALLBACK_HREF = '/dashboard';

/**
 * Returns href unchanged only when it is a same-origin path: a single
 * leading "/" not followed by another "/" or "\". Everything else — every
 * URL scheme and every protocol-relative form — collapses to the fallback.
 */
export const toSafeHref = (href: unknown): string =>
  typeof href === 'string' && /^\/(?![/\\])/.test(href) ? href : FALLBACK_HREF;

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

export interface SafeLinkAttributes {
  href: string;
  linkText: string;
  linkInformation: string;
}

export interface SafeServiceError {
  errorInformation: string;
  linkAttributes?: SafeLinkAttributes;
}

/**
 * Coerces an untrusted, freshly-parsed serviceErrorProps object into a
 * known shape: every field forced to a string (so a non-string can no
 * longer crash the render) and the href passed through toSafeHref. The
 * link block is only produced when the caller actually supplied one, so a
 * plain error with no link still renders without one.
 */
export const normaliseServiceError = (raw: unknown): SafeServiceError => {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;

  const result: SafeServiceError = {
    errorInformation: asString(source.errorInformation),
  };

  if (source.linkAttributes && typeof source.linkAttributes === 'object') {
    const link = source.linkAttributes as Record<string, unknown>;
    result.linkAttributes = {
      href: toSafeHref(link.href),
      linkText: asString(link.linkText, 'Please return'),
      linkInformation: asString(link.linkInformation),
    };
  }

  return result;
};
