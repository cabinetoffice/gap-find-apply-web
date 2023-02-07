import CustomLink from '../../../components/custom-link/CustomLink';
import { getAdvertPublishInformationBySchemeIdResponse } from '../../../services/AdvertPageService.d';
import Scheme from '../../../types/Scheme';
import getConfig from 'next/config';
import moment from 'moment';
import AdvertStatusEnum from '../../../enums/AdvertStatus';

const publishedFindAGrantLinkInformation = (
  linkToAdvertInFindAGrant: string
) => (
  <div
    className="govuk-!-margin-bottom-6"
    data-cy="cy-published-advert-extra-information"
  >
    <p className="govuk-body">
      An advert for this grant is live on Find a grant. The link for your advert
      is below:
    </p>
    <CustomLink
      href={linkToAdvertInFindAGrant}
      customStyle="govuk-!-font-size-19 break-all-words"
      excludeSubPath
      dataCy="cy-link-to-advert-on-find"
    >
      {linkToAdvertInFindAGrant}
    </CustomLink>
  </div>
);

const informationForGrantAdvertStatus = (
  grantAdvertData: getAdvertPublishInformationBySchemeIdResponse
) => {
  const scheduledDate = moment(grantAdvertData?.data?.openingDate)
    .utc()
    .format('D MMMM YYYY');
  return grantAdvertData?.data?.grantAdvertStatus === AdvertStatusEnum.PUBLISHED
    ? 'You can make changes to your advert, or unpublish it, here:'
    : grantAdvertData?.data?.grantAdvertStatus === AdvertStatusEnum.SCHEDULED
    ? `Your advert is scheduled to be published on ${scheduledDate}`
    : 'You have created an advert, but it is not live on Find a grant';
};

const advertLinkRedirectBasedOnStatus = (
  grantAdvertData: getAdvertPublishInformationBySchemeIdResponse
) => {
  return grantAdvertData?.data?.grantAdvertStatus === AdvertStatusEnum.PUBLISHED
    ? 'summary'
    : grantAdvertData?.data?.grantAdvertStatus === AdvertStatusEnum.SCHEDULED
    ? 'summary'
    : 'section-overview';
};

const viewOrChangeLink = (
  redirectDestinationBasedOnStatus: any,
  schemeId: string,
  grantAdvertId: String | undefined
) => (
  <CustomLink
    href={`/scheme/${schemeId}/advert/${grantAdvertId}/${redirectDestinationBasedOnStatus}`}
    customStyle="govuk-!-font-size-19"
    dataCy="cyViewOrChangeYourAdvert-link"
  >
    View or change your advert
  </CustomLink>
);

const BuildAdvert = ({ schemeId, grantAdvertData }: BuildAdvertProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToAdvertInFindAGrant = `${publicRuntimeConfig.FIND_A_GRANT_URL}/grants/${grantAdvertData?.data?.contentfulSlug}`;
  return (
    <>
      <h2
        className="govuk-heading-m govuk-!-padding-top-4"
        data-testid="build-advert-component"
        data-cy="build-advert-component"
      >
        Grant advert
      </h2>

      {grantAdvertData?.status === 200 ? (
        <div className="govuk-!-margin-bottom-6">
          {grantAdvertData?.data?.grantAdvertStatus ===
            AdvertStatusEnum.PUBLISHED &&
            publishedFindAGrantLinkInformation(linkToAdvertInFindAGrant)}

          <div>
            <p
              className="govuk-body"
              data-cy="cy-information-published-status-tag-line"
            >
              {informationForGrantAdvertStatus(grantAdvertData)}
            </p>
            {viewOrChangeLink(
              advertLinkRedirectBasedOnStatus(grantAdvertData),
              schemeId,
              grantAdvertData?.data?.grantAdvertId
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="govuk-body" data-cy="cy-create-an-advert-text">
            Create and publish an advert for your grant.
          </p>
          <CustomLink
            href={`/scheme/${schemeId}/advert/name`}
            dataCy="cyBuildAdvert"
            isButton
          >
            Create advert
          </CustomLink>
        </div>
      )}
    </>
  );
};

type BuildAdvertProps = {
  schemeId: Scheme['schemeId'];
  grantAdvertData: getAdvertPublishInformationBySchemeIdResponse;
};

export default BuildAdvert;
