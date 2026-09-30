import { Redirect } from 'next';
import ServiceError from '../types/ServiceError';
import { FALLBACK_HREF, toSafeHref } from './safeHref';

const SUB_PATH = process.env.SUB_PATH || '/apply/admin';

/**
 * The "Please return" link on the error page used to be built from the raw
 * Referer, passed as an absolute URL with excludeSubPath=true so it wasn't
 * double-prefixed. That absolute-URL path is what the reflected-XSS report
 * abused, so callers now reduce the Referer to a same-origin relative path
 * (dropping the base path, which CustomLink re-adds). The Referer is itself
 * attacker-influenceable, so the result is still validated by toSafeHref.
 */
const refererToRelativeHref = (referer?: string): string => {
  if (!referer) return FALLBACK_HREF;
  try {
    // A real Referer is absolute; the dummy base is only used if a relative
    // value is supplied, and is discarded for an absolute one.
    const url = new URL(referer, 'http://n');
    const path =
      (url.pathname.startsWith(SUB_PATH)
        ? url.pathname.slice(SUB_PATH.length)
        : url.pathname) + url.search;
    return toSafeHref(path);
  } catch {
    return FALLBACK_HREF;
  }
};

const generateErrorPageParams = (errorInformation: string, href: string) => ({
  errorInformation,
  linkAttributes: {
    href,
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
});

const generateErrorPageRedirect = (errorInformation: string, href: string) => ({
  redirect: {
    statusCode: 302,
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      generateErrorPageParams(errorInformation, href)
    )}`,
  } as Redirect,
});

const generateErrorPageRedirectV2 = (
  errorCode: string,
  errorPageParams: ServiceError | string
) => ({
  redirect: {
    statusCode: 302,
    destination: `/error-page/code/${errorCode}?href=${
      typeof errorPageParams === 'string'
        ? errorPageParams
        : errorPageParams.linkAttributes?.href
    }`,
  } as Redirect,
});

const generateErrorPageAdvertAlreadyPublished = (
  schemeId: string,
  advertId: string
) => ({
  redirect: {
    statusCode: 302,
    destination: `/scheme/${schemeId}/advert/${advertId}/error-multiple-editors`,
  } as Redirect,
});

const generateErrorPageMultipleEditors = (
  applicationId: string,
  isSectionDeletedError: boolean
) => {
  const errorMessage =
    isSectionDeletedError &&
    'The section or question you were editing has been deleted and your changes could not be saved.';

  return {
    redirect: {
      statusCode: 302,
      destination: `/build-application/${applicationId}/error-multiple-editors${
        errorMessage ? `?error=${errorMessage}` : ''
      }`,
    } as Redirect,
  };
};

const generateErrorMessageFromStatusCode = (errorCode: string): string => {
  switch (errorCode.toString()) {
    case 'GRANT_ADVERT_NOT_FOUND':
      return 'The advert you are trying to access has not been found.';
    case 'GRANT_SCHEME_NOT_FOUND':
      return 'The scheme you are trying to access has not been found.';
    case 'ACCESS_DENIED':
      return "You don't have permission to visit this page.";
    case 'WRONG_ARGUMENT_TYPE_PASSED':
      return 'You supplied invalid data to our server.';
    default:
      return 'Something went wrong when trying to load the page.';
  }
};

const handleMultipleEditorsError = (err: any) => {
  if (err?.response?.data?.error?.message.includes('MULTIPLE_EDITORS')) {
    const isSectionDeletedError =
      err?.response?.data?.error?.message ===
      'MULTIPLE_EDITORS_SECTION_DELETED';

    const applicationId = err.config.url
      .split('/application-forms/')
      .pop()
      .split('/')[0];

    return generateErrorPageMultipleEditors(
      applicationId,
      isSectionDeletedError
    );
  }
};

export {
  handleMultipleEditorsError,
  generateErrorPageParams,
  generateErrorPageRedirect,
  refererToRelativeHref,
  generateErrorPageRedirectV2,
  generateErrorMessageFromStatusCode,
  generateErrorPageMultipleEditors,
  generateErrorPageAdvertAlreadyPublished,
};
