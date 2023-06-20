import { Redirect } from 'next';

const errorPageParams = (submissionId: string) => ({
  errorInformation:
    'Something went wrong while trying to upload your equality and diversity responses',
  linkAttributes: {
    href: `/submissions/${submissionId}/equality-and-diversity`,
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
});

const errorPageRedirect = (submissionId: string): { redirect: Redirect } => ({
  redirect: {
    statusCode: 302,
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorPageParams(submissionId)
    )}`,
  }
});

export { errorPageParams, errorPageRedirect };
