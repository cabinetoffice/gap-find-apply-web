import { Redirect } from 'next';

const errorPageParams = {
  errorInformation:
    'Something went wrong while trying to create the grant scheme.',
  linkAttributes: {
    href: '/dashboard',
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
};

const serviceErrorRedirect = {
  redirect: {
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorPageParams
    )}`,
    statusCode: 302,
  } as Redirect,
};

export { errorPageParams, serviceErrorRedirect };
