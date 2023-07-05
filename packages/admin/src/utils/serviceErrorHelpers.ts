import { Redirect } from 'next';

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

const generateErrorPageRedirectV2 = (errorCode: string, href: string) => ({
  redirect: {
    statusCode: 302,
    destination: `/error-page/code/${errorCode}?href=${href}`,
  } as Redirect,
});

const generateErrorMessageFromStatusCode = (errorCode: string): string => {
  let message = '';
  switch (errorCode.toString()) {
    case 'GRANT_ADVERT_NOT_FOUND':
      message = 'The advert you are trying to access has not been found.';
      break;
    case 'GRANT_SCHEME_NOT_FOUND':
      message = 'The scheme you are trying to access has not been found.';
      break;
    case 'ACCESS_DENIED':
      message = "You don't have permission to visit this page.";
      break;
    case 'WRONG_ARGUMENT_TYPE_PASSED':
      message = 'You supplied invalid data to our server.';
      break;
    default:
      message = 'Something went wrong when trying to load the page.';
      break;
  }
  return message;
};

export {
  generateErrorPageParams,
  generateErrorPageRedirect,
  generateErrorPageRedirectV2,
  generateErrorMessageFromStatusCode,
};
