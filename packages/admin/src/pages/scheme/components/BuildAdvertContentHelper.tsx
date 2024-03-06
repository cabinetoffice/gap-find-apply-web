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
    'HH:mma'
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
    [SCHEDULED]: `Your advert is scheduled to be published on ${scheduledDate}.`,
  };

  return (
    CONTENT_MAP[grantAdvertStatus] ??
    'You have created an advert, but it is not live on Find a grant.'
  );
}

export function getLastUpdatedByText({
  lastUpdated,
  lastPublishedDate,
  firstPublishedDate,
  grantAdvertStatus,
  validLastUpdated,
  lastUpdatedByEmail,
  created,
}: ValidAdvertData) {
  const publishedDateString = formatTimeStamp(
    lastPublishedDate ?? (firstPublishedDate as string)
  );
  const lastUpdatedString = formatTimeStamp(lastUpdated);

  const invalidLastUpdatedString = `It was created by ${lastUpdatedByEmail} ${formatTimeStamp(
    created
  )}.`;

  const CONTENT_MAP: StatusContentMap = {
    [PUBLISHED]: `It was published by ${lastUpdatedByEmail} ${publishedDateString}.`,
    [SCHEDULED]: validLastUpdated
      ? `Your advert was scheduled to be published ${lastUpdatedString} by ${lastUpdatedByEmail}.`
      : invalidLastUpdatedString,
  };

  const defaultText = validLastUpdated
    ? `It was last edited by ${lastUpdatedByEmail} ${lastUpdatedString}.`
    : invalidLastUpdatedString;

  return CONTENT_MAP[grantAdvertStatus] ?? defaultText;
}

export const LastUpdatedBy = ({ grantAdvertData }: AdvertData) => (
  <p className="govuk-body">{getLastUpdatedByText(grantAdvertData)}</p>
);

export const GrantStatus = ({ grantAdvertData }: AdvertData) => (
  <p className="govuk-body" data-cy="cy-information-published-status-tag-line">
    {getGrantStatusText(grantAdvertData)}
  </p>
);
