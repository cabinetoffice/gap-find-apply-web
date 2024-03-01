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

const informationForGrantAdvertStatus = ({
  publishingInfo: { openingDate, grantAdvertStatus },
}: ValidAdvertData) => {
  const scheduledDate = moment(openingDate).utc().format('D MMMM YYYY');
  return grantAdvertStatus === AdvertStatusEnum.PUBLISHED
    ? 'You can make changes to your advert or unpublish it here:'
    : grantAdvertStatus === AdvertStatusEnum.SCHEDULED
    ? `Your advert is scheduled to be published on ${scheduledDate}`
    : 'You have created an advert, but it is not live on Find a grant';
};

const advertLinkRedirectBasedOnStatus = ({
  publishingInfo: { grantAdvertStatus },
}: ValidAdvertData) => {
  return grantAdvertStatus === AdvertStatusEnum.PUBLISHED
    ? 'summary'
    : grantAdvertStatus === AdvertStatusEnum.SCHEDULED
    ? 'summary'
    : 'section-overview';
};

const viewOrChangeLink = (
  redirectDestinationBasedOnStatus: any,
  schemeId: string,
  grantAdvertId: string | undefined
) => (
  <CustomLink
    href={`/scheme/${schemeId}/advert/${grantAdvertId}/${redirectDestinationBasedOnStatus}`}
    customStyle="govuk-!-font-size-19"
    dataCy="cyViewOrChangeYourAdvert-link"
  >
    View or change your advert
  </CustomLink>
);

const formatTimeStamp = (timestamp: string) => {
  return `on ${moment(timestamp).format('D MMMM YYYY')} at ${moment(
    timestamp
  ).format('HH:mm')}`;
};

type ValidAdvertData = Exclude<
  getAdvertPublishInformationBySchemeIdResponse['data'],
  null
>;

type GetLastUpdatedByText = (
  lastUpdatedByEmail: string,
  publishingInfo: ValidAdvertData['publishingInfo']
) => string;

const getLastUpdatedByText: GetLastUpdatedByText = (
  lastUpdatedByEmail: string,
  { lastUpdated, grantAdvertStatus }
) => {
  const lastModifiedString = formatTimeStamp(lastUpdated as string);
  if (grantAdvertStatus === AdvertStatusEnum.PUBLISHED)
    return `It was published by ${lastUpdatedByEmail} ${lastModifiedString}`;

  if (grantAdvertStatus === AdvertStatusEnum.SCHEDULED)
    return `Your advert was scheduled to be published ${lastModifiedString} by ${lastUpdatedByEmail}`;

  return `It was last edited by ${lastUpdatedByEmail} ${lastModifiedString}`;
};

const LastUpdatedBy = ({
  lastUpdatedByEmail,
  grantAdvertData,
}: {
  lastUpdatedByEmail: string;
  grantAdvertData: ValidAdvertData;
}) => {
  const text = getLastUpdatedByText(
    lastUpdatedByEmail,
    grantAdvertData.publishingInfo
  );
  return <p className="govuk-body">{text}</p>;
};

const BuildAdvert = ({ schemeId, grantAdvert }: BuildAdvertProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToAdvertInFindAGrant = `${publicRuntimeConfig.FIND_A_GRANT_URL}/grants/${grantAdvert?.data?.publishingInfo?.contentfulSlug}`;

  return (
    <>
      <h2
        className="govuk-heading-m govuk-!-padding-top-4"
        data-testid="build-advert-component"
        data-cy="build-advert-component"
      >
        Grant advert
      </h2>

      {grantAdvert.status === 200 && grantAdvert.data ? (
        <div className="govuk-!-margin-bottom-6">
          {grantAdvert.data.publishingInfo.grantAdvertStatus ===
            AdvertStatusEnum.PUBLISHED &&
            publishedFindAGrantLinkInformation(linkToAdvertInFindAGrant)}

          <div>
            {grantAdvert.data.lastUpdatedByEmail && (
              <LastUpdatedBy
                lastUpdatedByEmail={grantAdvert.data.lastUpdatedByEmail || ''}
                grantAdvertData={grantAdvert.data}
              />
            )}
            <p
              className="govuk-body"
              data-cy="cy-information-published-status-tag-line"
            >
              {informationForGrantAdvertStatus(grantAdvert.data)}
            </p>

            {viewOrChangeLink(
              advertLinkRedirectBasedOnStatus(grantAdvert.data),
              schemeId,
              grantAdvert.data.publishingInfo.grantAdvertId
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
  grantAdvert: getAdvertPublishInformationBySchemeIdResponse;
};

export default BuildAdvert;
