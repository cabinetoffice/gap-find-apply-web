import { Redirect } from 'next';
import ServiceError from '../types/ServiceError';

const generateErrorPageParams = (errorInformation: string, href: string) => ({
  errorInformation,
  linkAttributes: {
    href,
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
});

const generateErrorPageRedirect = (
  errorInformation: string,
  href: string,
  excludeSubPath = false
) => ({
  redirect: {
    statusCode: 302,
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      generateErrorPageParams(errorInformation, href)
    )}${excludeSubPath ? '&excludeSubPath=true' : ''}`,
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

export {
  generateErrorPageParams,
  generateErrorPageRedirect,
  generateErrorPageRedirectV2,
  generateErrorMessageFromStatusCode,
  generateErrorPageMultipleEditors,
  generateErrorPageAdvertAlreadyPublished,
};
