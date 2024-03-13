import { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import Meta from '../../../../../components/layout/Meta';
import { getGrantAdvertPublishInformationBySchemeId } from '../../../../../services/AdvertPageService';
import CustomError from '../../../../../types/CustomError';
import InferProps from '../../../../../types/InferProps';
import { generateErrorPageRedirectV2 } from '../../../../../utils/serviceErrorHelpers';
import {
  getSessionIdFromCookies,
  getUserTokenFromCookies,
} from '../../../../../utils/session';
import Link from 'next/link';
import { formatDateTimeForSentence } from '../../../../../utils/dateFormatterGDS';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);

  let grantAdvertData;
  try {
    grantAdvertData = await getGrantAdvertPublishInformationBySchemeId(
      sessionCookie,
      getUserTokenFromCookies(req),
      schemeId
    );
    if (
      grantAdvertData.data?.grantAdvertStatus !== 'PUBLISHED' &&
      grantAdvertData.data?.grantAdvertStatus !== 'SCHEDULED'
    ) {
      return {
        redirect: {
          destination: `/scheme/${schemeId}/advert/${advertId}/section-overview`,
          statusCode: 307,
        },
      };
    }
  } catch (err) {
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;

    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/scheme/${schemeId}/advert/${advertId}/section-overview`
    );
  }

  const {
    data: {
      contentfulSlug,
      grantAdvertStatus,
      lastUpdated: lastEditedDate,
      lastUpdatedByEmail: editorEmail,
    },
  } = grantAdvertData;

  return {
    props: {
      backToAccountLink: `/scheme/${schemeId}/advert/${advertId}/section-overview`,
      linkToAdvertInFindAGrant: `${process.env.FIND_A_GRANT_URL}/grants/${contentfulSlug}`,
      grantAdvertStatus,
      lastEditedDate,
      editorEmail,
    },
  };
};

const ErrorMultipleEditorsPage = ({
  backToAccountLink,
  linkToAdvertInFindAGrant,
  grantAdvertStatus,
  lastEditedDate,
  editorEmail,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Manage Advert - Your changes could not be saved" />
      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Your changes could not be saved</h1>
        <p className="govuk-body">
          {grantAdvertStatus === 'PUBLISHED'
            ? 'Another editor has published your advert, so your changes could not be saved.'
            : 'Another editor has scheduled your advert to go live, so your changes could not be saved.'}
        </p>
        <p className="govuk-body">
          The last edit was made by {editorEmail} on{' '}
          {formatDateTimeForSentence(lastEditedDate as unknown as Date)}.
        </p>
        <p className="govuk-body">
          To unpublish and make changes to the advert,{' '}
          <Link href={backToAccountLink}>return to the advert overview.</Link>
        </p>
        <p className="govuk-body">
          You can view the advert on Find a grant here:{' '}
          <Link href={linkToAdvertInFindAGrant}>
            {linkToAdvertInFindAGrant}
          </Link>
        </p>
      </div>
    </>
  );
};

export default ErrorMultipleEditorsPage;
