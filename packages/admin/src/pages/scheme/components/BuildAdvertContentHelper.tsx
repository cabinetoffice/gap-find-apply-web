import moment from 'moment';
import AdvertStatusEnum from '../../../enums/AdvertStatus';
import { getAdvertPublishInformationBySchemeIdResponse } from '../../../services/AdvertPageService.d';

const { PUBLISHED, SCHEDULED } = AdvertStatusEnum;

type StatusContentMap = { [Key in AdvertStatusEnum]?: string };

export type ValidAdvertData = NonNullable<
  getAdvertPublishInformationBySchemeIdResponse['data']
>;

export type AdvertData = {
  grantAdvertData: ValidAdvertData;
};

const formatTimeStamp = (timestamp: string) =>
  `on ${moment(timestamp).format('D MMMM YYYY')} at ${moment(timestamp).format(
    'HH:mm A'
  )}`;

export const getAdvertLink = ({ grantAdvertStatus }: ValidAdvertData) =>
  [SCHEDULED, PUBLISHED].includes(grantAdvertStatus)
    ? 'summary'
    : 'section-overview';

export function getGrantStatusText({
  openingDate,
  grantAdvertStatus,
}: ValidAdvertData) {
  const scheduledDate = moment(openingDate).utc().format('D MMMM YYYY');

  const CONTENT_MAP: StatusContentMap = {
    [PUBLISHED]: 'You can make changes to your advert or unpublish it here:',
    [SCHEDULED]: `Your advert is scheduled to be published on ${scheduledDate}`,
  };

  return (
    CONTENT_MAP[grantAdvertStatus] ??
    'You have created an advert, but it is not live on Find a grant'
  );
}

export function getLastUpdatedByText({
  lastUpdated,
  grantAdvertStatus,
  lastUpdatedByEmail,
}: ValidAdvertData) {
  const lastModifiedString = formatTimeStamp(lastUpdated as string);

  const CONTENT_MAP: StatusContentMap = {
    [PUBLISHED]: `It was published by ${lastUpdatedByEmail} ${lastModifiedString}`,
    [SCHEDULED]: `Your advert was scheduled to be published ${lastModifiedString} by ${lastUpdatedByEmail}`,
  };

  return (
    CONTENT_MAP[grantAdvertStatus] ??
    `It was last edited by ${lastUpdatedByEmail} ${lastModifiedString}`
  );
}

export const LastUpdatedBy = ({ grantAdvertData }: AdvertData) => (
  <p className="govuk-body">{getLastUpdatedByText(grantAdvertData)}</p>
);

export const GrantStatus = ({ grantAdvertData }: AdvertData) => (
  <p className="govuk-body" data-cy="cy-information-published-status-tag-line">
    {getGrantStatusText(grantAdvertData)}
  </p>
);
