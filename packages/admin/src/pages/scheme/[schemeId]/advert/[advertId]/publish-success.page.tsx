import { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import { getAdvertStatusBySchemeId } from '../../../../../services/AdvertPageService';
import CustomError from '../../../../../types/CustomError';
import InferProps from '../../../../../types/InferProps';
import { generateErrorPageRedirectV2 } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  let grantAdvertData;

  try {
    grantAdvertData = await getAdvertStatusBySchemeId(
      getSessionIdFromCookies(req),
      schemeId
    );
    if (grantAdvertData.data?.grantAdvertStatus !== 'PUBLISHED') {
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

  return {
    props: {
      backToAccountLink: `/scheme/${schemeId}/advert/${advertId}/survey`,
      linkToAdvertInFindAGrant: `${process.env.FIND_A_GRANT_URL}/grants/${grantAdvertData?.data?.contentfulSlug}`,
    },
  };
};

const PublishSuccessPage = ({
  backToAccountLink,
  linkToAdvertInFindAGrant,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Publish grant advert - Manage a grant" />

      <div className="govuk-!-padding-top-7">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1 className="govuk-panel__title" data-cy="cy-advert-published">
                Grant advert published
              </h1>
            </div>

            <p className="govuk-body">
              Here is a link to your advert on Find a grant:
            </p>

            <p className="govuk-body break-all-words">
              <a
                href={linkToAdvertInFindAGrant}
                className="govuk-link"
                data-cy="cy-link-to-advert"
              >
                {linkToAdvertInFindAGrant}
              </a>
            </p>

            <p className="govuk-body">
              You can make changes to your advert or unpublish it at any time.
            </p>

            <CustomLink
              href={backToAccountLink}
              isButton
              dataCy="back-to-my-account-button"
            >
              Back to my account
            </CustomLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublishSuccessPage;
