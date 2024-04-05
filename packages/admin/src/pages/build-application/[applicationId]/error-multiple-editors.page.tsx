import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import InferProps from '../../../types/InferProps';
import {
  getApplicationFormSummary,
  getLastEditedEmail,
} from '../../../services/ApplicationService';
import Meta from '../../../components/layout/Meta';
import { getSessionIdFromCookies } from '../../../utils/session';
import { formatDateTimeForSentence } from '../../../utils/dateFormatterGDS';

const getLastEditedDate = async (
  applicationId: string,
  sessionCookie: string
): Promise<string> => {
  try {
    const application = await getApplicationFormSummary(
      applicationId,
      sessionCookie,
      false,
      false
    );
    const {
      audit: { lastUpdated },
    } = application;
    return formatDateTimeForSentence(new Date(lastUpdated));
  } catch (e) {
    console.log(e);
    return 'unknown';
  }
};

const getLastEditedBy = async (
  applicationId: string,
  sessionCookie: string
): Promise<string> => {
  try {
    return (
      (await getLastEditedEmail(applicationId, sessionCookie)) || 'unknown'
    );
  } catch (e) {
    console.log(e);
    return 'unknown';
  }
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const sessionCookie = getSessionIdFromCookies(context.req);
  const { applicationId } = context.params as Record<string, string>;

  const lastEditedDate = await getLastEditedDate(applicationId, sessionCookie);
  const lastEditedBy = await getLastEditedBy(applicationId, sessionCookie);

  return {
    props: {
      pageData: {
        applicationId,
        lastEditedBy,
        lastEditedDate,
        errorText: context.query?.error || '',
      },
    },
  };
};

export default function ErrorMultipleEditorsPage({
  pageData: { errorText, applicationId, lastEditedBy, lastEditedDate },
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="Manage Application - Your changes could not be saved" />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Your changes could not be saved</h1>
        <p className="govuk-body">
          {errorText ||
            'Another editor has made changes to the grant and your changes could not be saved.'}
        </p>
        <p className="govuk-body">
          The last edit was made by {lastEditedBy} on {lastEditedDate}.
        </p>
        <p className="govuk-body">
          To try again, you can{' '}
          <Link href={`/build-application/${applicationId}/dashboard`}>
            return to the application builder
          </Link>
          .
        </p>
      </div>
    </>
  );
}
