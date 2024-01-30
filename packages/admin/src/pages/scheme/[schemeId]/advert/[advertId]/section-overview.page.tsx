import { AxiosError } from 'axios';
import {
  FlexibleQuestionPageLayout,
  ImportantBanner,
  TaskList,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { ConfirmationMessage } from '../../../../../components/confirmation-message/ConfirmationMessage';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';
import {
  getAdvertStatusBySchemeId,
  getSectionOverviewPageContent,
} from '../../../../../services/AdvertPageService';
import CustomError from '../../../../../types/CustomError';
import { AdvertSection } from '../../../../../types/GetSectionOverviewPageContentResponse';
import InferProps from '../../../../../types/InferProps';
import { generateErrorPageRedirectV2 } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { PreviewSideBar } from './components/PreviewSideBar';
import { ReviewAndPublishButtonGroup } from './components/ReviewAndPublishButtonGroup';
import { STATUS_TAGS } from './section-overview-utils';
import { advertIsPublishedOrScheduled } from './summary/components/util';
import getConfig from 'next/config';

export const getServerSideProps = async ({
  req,
  res,
  params,
  query,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId } = params as Record<string, string>;
  const { recentlyUnpublished = null } = query as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);

  try {
    const { isPublishDisabled, grantSchemeName, sections, advertName } =
      await getSectionOverviewPageContent(sessionCookie, schemeId, advertId);

    const grantAdvertData = await getAdvertStatusBySchemeId(
      sessionCookie,
      schemeId
    );

    if (advertIsPublishedOrScheduled(grantAdvertData)) {
      return {
        redirect: {
          destination: `/scheme/${schemeId}/advert/${advertId}/summary`,
          statusCode: 302,
        },
      };
    }

    return {
      props: {
        isPublishDisabled,
        grantSchemeName,
        advertName,
        sections,
        schemeId,
        advertId,
        grantAdvertData,
        recentlyUnpublished,
        csrfToken: res.getHeader('x-csrf-token') as string,
      },
    };
  } catch (err) {
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(errorMessageObject.code, '/scheme-list');
  }
};

const SectionOverview = ({
  isPublishDisabled,
  grantSchemeName,
  advertName,
  sections,
  schemeId,
  advertId,
  grantAdvertData,
  recentlyUnpublished,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();
  const list = sections.map(({ id, title, pages }: AdvertSection) => {
    const subList = pages.map((page) => {
      const taskName = (
        <CustomLink
          href={`/scheme/${schemeId}/advert/${advertId}/${id}/${page.id}`}
          dataCy={`cy-${title}-sublist-task-name-${page.title}`}
        >
          {page.title}
        </CustomLink>
      );
      const pageStatus = page.status;
      return {
        taskName: taskName,
        taskStatus: {
          displayName: STATUS_TAGS[pageStatus].displayName,
          colourClass: STATUS_TAGS[pageStatus].colourClass,
        },
      };
    });

    return { value: title, subList: subList };
  });

  const getAdvertActionSection = () => {
    if (grantAdvertData.data?.grantAdvertStatus === AdvertStatusEnum.DRAFT) {
      return (
        <div>
          <h2 className="govuk-heading-m" data-cy="cy-confirm-publish-header">
            Publish your advert
          </h2>
          <div data-cy="cy-confirm-publish--help-text">
            <p className="govuk-body">
              If you have finished creating your advert, you can publish it on
              Find a grant.
            </p>
            <p className="govuk-body">
              You will be able to check your advert again before it is
              published.
            </p>
          </div>

          <ReviewAndPublishButtonGroup
            schemeId={schemeId}
            advertId={advertId}
            isPublishDisabled={isPublishDisabled}
          />
        </div>
      );
    } else if (
      grantAdvertData.data?.grantAdvertStatus === AdvertStatusEnum.UNSCHEDULED
    ) {
      return (
        <div>
          <h2
            className="govuk-heading-m"
            data-cy="cy-review-and-publish-advert-header"
          >
            Review and publish your advert
          </h2>
          <p
            className="govuk-body"
            data-cy="cy-review-and-publish-advert-body-1"
          >
            You need to review and publish your advert, even if you have not
            made any changes.
          </p>
          <p
            className="govuk-body"
            data-cy="cy-review-and-publish-advert-body-2"
          >
            If you do not it will not be added to Find a grant, or scheduled to
            be added on the opening date.
          </p>

          <ReviewAndPublishButtonGroup
            schemeId={schemeId}
            advertId={advertId}
            isPublishDisabled={isPublishDisabled}
          />
        </div>
      );
    }
  };

  return (
    <>
      <Meta title={`${grantSchemeName} advert page - Manage a grant`} />

      <CustomLink
        href={`/scheme/${schemeId}`}
        isBackButton
        dataCy="cy-back-button"
      />

      <div className="govuk-!-padding-top-7">
        {recentlyUnpublished && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <ConfirmationMessage
                title="Your advert has been unpublished"
                message="Your advert does not appear on Find a grant."
              />
            </div>
          </div>
        )}

        {grantAdvertData.data?.grantAdvertStatus ===
          AdvertStatusEnum.UNSCHEDULED && (
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <ImportantBanner
                bannerHeading="You need to review and publish your advert again, even if
                    you do not make any changes."
              />
            </div>
          </div>
        )}

        <FlexibleQuestionPageLayout
          formAction={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
          pageCaption={advertName}
          fieldErrors={[]}
          csrfToken={csrfToken}
          sideBarContent={
            <PreviewSideBar schemeId={schemeId} advertId={advertId} />
          }
        >
          <h1 className="govuk-heading-l" data-cy="cy-summary-overview-header">
            Create an advert
          </h1>
          <div>
            <p className="govuk-body" data-cy="cy-summary-overview-help-text">
              How to create an advert:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li data-cy="cy-summary-overview-help-text-bullet-1">
                you must complete each section below
              </li>
              <li data-cy="cy-summary-overview-help-text-bullet-2">
                once all sections are complete you can publish your advert
              </li>
              <li data-cy="cy-summary-overview-help-text-bullet-3">
                you can save your progress and come back later
              </li>
            </ul>
            <p className="govuk-body" data-cy="cy-summary-overview-help-text-2">
              This advert will be published on{' '}
              <a
                href={publicRuntimeConfig.FIND_A_GRANT_URL}
                target="_blank"
                className="govuk-link"
                rel="noreferrer noopener"
              >
                Find a Grant (opens in new tab)
              </a>
              .
            </p>
          </div>
          <TaskList listItems={list} />
          {getAdvertActionSection()}
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default SectionOverview;
