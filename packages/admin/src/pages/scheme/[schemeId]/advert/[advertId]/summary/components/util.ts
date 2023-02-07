import {
  grantAdvertStatus,
  getAdvertStatusBySchemeIdResponse,
} from '../../../../../../../services/AdvertPageService.d';

export function isGrantAdvertNotPublished(status: grantAdvertStatus) {
  return (
    status === 'DRAFT' || status === 'UNPUBLISHED' || status === 'UNSCHEDULED'
  );
}

export const advertIsPublishedOrScheduled = (
  grantAdvertData: getAdvertStatusBySchemeIdResponse
) => {
  if (
    grantAdvertData?.data?.grantAdvertStatus === 'PUBLISHED' ||
    grantAdvertData?.data?.grantAdvertStatus === 'SCHEDULED'
  ) {
    return true;
  } else {
    return false;
  }
};

export const summaryPageTitleWhenAdvertIsNotPublished = (
  status: grantAdvertStatus
) => {
  return isGrantAdvertNotPublished(status)
    ? 'Review your advert'
    : 'Your grant advert';
};
