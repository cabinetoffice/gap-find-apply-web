import { Redirect } from 'next';

const getErrorPageParams = (applicationId: string) => {
  return {
    errorInformation:
      'Something went wrong while trying to create the question.',
    linkAttributes: {
      href: `/build-application/${applicationId}/dashboard`,
      linkText: 'Please return',
      linkInformation: ' and try again.',
    },
  };
};

const questionErrorPageRedirect = (applicationId: string) => {
  return {
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify(
        getErrorPageParams(applicationId)
      )}`,
      statusCode: 302,
    } as Redirect,
  };
};

export { getErrorPageParams, questionErrorPageRedirect };
