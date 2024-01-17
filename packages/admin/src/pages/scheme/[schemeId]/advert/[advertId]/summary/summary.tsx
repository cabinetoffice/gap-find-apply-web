import { AxiosError } from 'axios';
import { TaskList } from 'gap-web-ui';
import moment from 'moment';
import { GetServerSidePropsContext } from 'next';
import React from 'react';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import {
  getAdvertStatusBySchemeId,
  getSummaryPageContent,
  publishAdvert,
  scheduleAdvert,
} from '../../../../../../services/AdvertPageService';
import { grantAdvertStatus } from '../../../../../../services/AdvertPageService.d';
import CustomError from '../../../../../../types/CustomError';
import {
  GrantAdvertQuestionResponseType,
  GrantAdvertSummaryPagePage,
  GrantAdvertSummaryPageQuestion,
  GrantAdvertSummaryPageSection,
} from '../../../../../../types/GetSummaryPageContentResponse';
import InferProps from '../../../../../../types/InferProps';
import callServiceMethod from '../../../../../../utils/callServiceMethod';
import { generateErrorPageRedirectV2 } from '../../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import { Date } from './components/Date';
import { DateTime } from './components/DateTime';
import { DefaultResponse } from './components/DefaultResponse';
import { List } from './components/List';
import PublishOrScheduleButton from './components/PublishOrScheduleButton';
import { RichText } from './components/RichText';
import { ShortText } from './components/ShortText';
import UnpublishButton from './components/UnpublishButton';
import UnscheduleButton from './components/UnscheduleButton';
import {
  advertIsPublishedOrScheduled,
  isGrantAdvertNotPublished,
  summaryPageTitleWhenAdvertIsNotPublished,
} from './components/util';

export const getServerSideProps = async ({
  req,
  res,
  params,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);

  try {
    const { sections, advertName, status } = await getSummaryPageContent(
      sessionCookie,
      schemeId,
      advertId
    );

    const dateSection = sections?.find(
      (section) => section.id === 'applicationDates'
    );
    const pageSection = dateSection?.pages.find((page) => page.id === '1');
    const openingDateQuestion = pageSection?.questions.find(
      (question) => question.id === 'grantApplicationOpenDate'
    );
    const futurePublishingDate =
      checkIfOpeningDateIsInFuture(openingDateQuestion);

    const response = await callServiceMethod(
      req,
      res,
      futurePublishingDate
        ? () => scheduleAdvert(sessionCookie, advertId)
        : () => publishAdvert(sessionCookie, advertId),
      futurePublishingDate
        ? `/scheme/${schemeId}/advert/${advertId}/schedule-success`
        : `/scheme/${schemeId}/advert/${advertId}/publish-success`,
      `/scheme/${schemeId}/advert/${advertId}/summary`
    );

    if ('redirect' in response) {
      return response;
    }

    const grantAdvertData = await getAdvertStatusBySchemeId(
      sessionCookie,
      schemeId
    );

    return {
      props: {
        advertName,
        sections,
        schemeId,
        advertId,
        futurePublishingDate,
        resolvedUrl,
        status,
        csrfToken: (req as any).csrfToken?.() || '',
        grantAdvertData,
      },
    };
  } catch (err) {
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(errorMessageObject.code, '/summary');
  }
};

const checkIfOpeningDateIsInFuture = (
  question: GrantAdvertSummaryPageQuestion | undefined
): boolean => {
  if (
    question?.multiResponse !== null &&
    question?.multiResponse[0] &&
    question?.multiResponse[1] &&
    question?.multiResponse[2] &&
    question?.multiResponse[3] &&
    question?.multiResponse[4]
  ) {
    const [day, month, year, hour, minute] = question.multiResponse;
    const openingDate = moment([
      year,
      Number.parseInt(month) - 1,
      day,
      hour,
      minute,
    ]);
    return openingDate.isAfter(moment());
  } else {
    return false;
  }
};

const RenderQuestion = (
  question: GrantAdvertSummaryPageQuestion,
  section: GrantAdvertSummaryPageSection,
  page: GrantAdvertSummaryPagePage,
  schemeId: string,
  advertId: string,
  status: grantAdvertStatus
) => {
  const props = {
    schemeId,
    advertId,
    section,
    page,
    question,
    status,
  };

  switch (question.responseType) {
    case GrantAdvertQuestionResponseType.DATE_TIME:
      return <DateTime {...props} />;
    case GrantAdvertQuestionResponseType.DATE:
      return <Date {...props} />;
    case GrantAdvertQuestionResponseType.RICH_TEXT:
      return <RichText {...props} />;
    case GrantAdvertQuestionResponseType.SHORT_TEXT:
      return <ShortText {...props} />;
    case GrantAdvertQuestionResponseType.LIST:
      return <List {...props} />;
    default:
      return <DefaultResponse {...props} />;
  }
};

const AdvertSummaryPage = ({
  advertName,
  sections,
  schemeId,
  futurePublishingDate,
  csrfToken,
  advertId,
  resolvedUrl,
  status,
  grantAdvertData,
}: InferProps<typeof getServerSideProps>) => {
  const list = sections.map((section) => {
    const customSubList = (
      <dl className="govuk-summary-list">
        {section.pages.map((page) => (
          <React.Fragment key={`${section.id}-${page.id}`}>
            {page.questions.map((question) => (
              <React.Fragment key={`${section.id}-${page.id}-${question.id}`}>
                {RenderQuestion(
                  question,
                  section,
                  page,
                  schemeId,
                  advertId,
                  status
                )}
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}
      </dl>
    );
    return { value: section.title, customSubList: customSubList };
  });
  return (
    <>
      <Meta
        title={`${summaryPageTitleWhenAdvertIsNotPublished(
          status
        )} - Manage a grant`}
      />

      <CustomLink
        href={
          isGrantAdvertNotPublished(status)
            ? `/scheme/${schemeId}/advert/${advertId}/section-overview`
            : `/scheme/${schemeId}`
        }
        isBackButton
        ariaLabel="Back"
        dataCy="cy-advert-summary-page-back-button"
      />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds">
          <div>
            {advertIsPublishedOrScheduled(grantAdvertData) && (
              <strong
                data-testid="advertStatusTag"
                className="govuk-tag govuk-tag--green govuk-!-margin-bottom-3"
                data-cy={`cy-status-tag-${grantAdvertData?.data?.grantAdvertStatus}`}
              >
                <span className="govuk-visually-hidden">Advert status: </span>
                {grantAdvertData?.data?.grantAdvertStatus}
              </strong>
            )}

            <span className="govuk-caption-l" data-cy="cy-summary-caption">
              {advertName}
            </span>
            <h1 className="govuk-heading-l" data-cy="cy-summary-heading">
              {summaryPageTitleWhenAdvertIsNotPublished(status)}
            </h1>

            {status === 'PUBLISHED' && (
              <UnpublishButton schemeId={schemeId} advertId={advertId} />
            )}
            {status === 'SCHEDULED' && (
              <UnscheduleButton schemeId={schemeId} advertId={advertId} />
            )}

            <p className="govuk-body">
              Below is a summary of the information you have entered.{' '}
              {isGrantAdvertNotPublished(status) && (
                <span>You can go back and change anything you need to.</span>
              )}
            </p>
          </div>
        </div>

        <div className="govuk-grid-column-full">
          <TaskList listItems={list} />
        </div>
      </div>

      {isGrantAdvertNotPublished(status) ? (
        <PublishOrScheduleButton
          resolvedUrl={resolvedUrl}
          csrfToken={csrfToken}
          futurePublishingDate={futurePublishingDate}
          schemeId={schemeId}
          advertId={advertId}
          advertName={advertName}
        />
      ) : (
        <CustomLink
          href={`/scheme/${schemeId}`}
          ariaLabel={'Back to scheme details'}
          customStyle="govuk-!-font-size-19"
          dataCy="cy-back-to-scheme-link"
        >
          Back
        </CustomLink>
      )}
    </>
  );
};

export default AdvertSummaryPage;
