import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import InferProps from '../../../types/InferProps';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import Meta from '../../../components/layout/Meta';
import { getSessionIdFromCookies } from '../../../utils/session';
import { formatDateTimeForSentence } from '../../../utils/dateFormatterGDS';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const sessionCookie = getSessionIdFromCookies(context.req);
  const { applicationId } = context.params as Record<string, string>;

  const application = await getApplicationFormSummary(
    applicationId,
    sessionCookie,
    false,
    false
  );
  const {
    audit: { lastUpdateBy, lastUpdated },
  } = application;

  // const editorOrPublisherEmail = await getLastEditedEmail(
  //   applicationId,
  //   sessionCookie
  // );

  return {
    props: {
      pageData: {
        applicationId,
        lastEditedBy: lastUpdateBy,
        lastEditedDate: formatDateTimeForSentence(new Date(lastUpdated)),
      },
    },
  };
};

export default function ErrorMultipleEditorsPage({
  pageData: { applicationId, lastEditedBy, lastEditedDate },
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="Manage Application - Your changes could not be saved" />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Your changes could not be saved</h1>
        <p className="govuk-body">
          Another editor has made changes to the grant and your changes could
          not be saved.
        </p>
        <p className="govuk-body">
          The last edit was made on {lastEditedDate}.
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
