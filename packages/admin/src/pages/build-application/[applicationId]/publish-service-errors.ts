import { Redirect } from 'next';

const errorPageParams = (applicationId: string, publish: boolean) => ({
  errorInformation: `Something went wrong while trying to ${
    publish ? 'publish' : 'unpublish'
  } the application.`,
  linkAttributes: {
    href: `/build-application/${applicationId}/dashboard`,
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
});

const errorPageRedirect = (applicationId: string, publish: boolean) => ({
  redirect: {
    statusCode: 302,
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorPageParams(applicationId, publish)
    )}`,
  } as Redirect,
});

export { errorPageParams, errorPageRedirect };
