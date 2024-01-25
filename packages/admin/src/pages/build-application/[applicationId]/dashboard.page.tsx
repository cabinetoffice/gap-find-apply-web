import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { getGrantScheme } from '../../../services/SchemeService';
import ServiceError from '../../../types/ServiceError';
import { getSessionIdFromCookies } from '../../../utils/session';
import PublishButton from './components/PublishButton';
import Sections from './components/Sections';
import UnpublishSummary from './components/UnpublishSummary';
import InferProps from '../../../types/InferProps';

export const getServerSideProps = async ({
  params,
  query,
  req,
}: GetServerSidePropsContext) => {
  const { applicationId } = params as Record<string, string>;
  const { recentlyUnpublished } = query;

  let grantScheme;
  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
    grantScheme = await getGrantScheme(
      applicationFormSummary.grantSchemeId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    const params: ServiceError = {
      errorInformation:
        'Something went wrong while trying to create an application',
      linkAttributes: {
        href: `/scheme-list`,
        linkText: 'Please find your scheme application form and continue.',
        linkInformation: 'Your previous progress has been saved.',
      },
    };

    return {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify(
          params
        )}`,
        permanent: false,
      },
    };
  }

  const applyToApplicationUrl =
    grantScheme.version === '1'
      ? `/applications/${applicationId}`
      : `/mandatory-questions/start?schemeId=${grantScheme.schemeId}`;

  return {
    props: {
      sections: applicationFormSummary.sections,
      grantApplicationName: applicationFormSummary.applicationName,
      applicationId: applicationFormSummary.grantApplicationId,
      grantSchemeId: applicationFormSummary.grantSchemeId,
      applicationStatus: applicationFormSummary.applicationStatus,
      recentlyUnpublished: !!recentlyUnpublished,
      applyToApplicationUrl,
    },
  };
};

const Dashboard = ({
  sections,
  grantApplicationName,
  applicationId,
  grantSchemeId,
  applicationStatus,
  recentlyUnpublished,
  applyToApplicationUrl,
}: InferProps<typeof getServerSideProps>) => {
  const { publicRuntimeConfig } = getConfig();
  const findAGrantLink = publicRuntimeConfig.FIND_A_GRANT_URL;

  const isPublishDisabled = sections.some((section) => {
    if (
      section.sectionId === 'ELIGIBILITY' ||
      section.sectionId === 'ESSENTIAL'
    ) {
      return section.sectionStatus !== 'COMPLETE';
    } else {
      return section.questions ? section.questions.length < 1 : true;
    }
  });

  return (
    <>
      <Meta title="Build an application form - Manage a grant" />

      <CustomLink
        href={`/scheme/${grantSchemeId}`}
        dataCy="cyBuildApplicationBackButton"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        {applicationStatus === 'PUBLISHED' && (
          <strong
            className="govuk-tag govuk-tag--green govuk-!-margin-bottom-4"
            aria-label="Application status"
            data-cy="cy_publishedDashboard-publishStatus"
          >
            Published
          </strong>
        )}

        {recentlyUnpublished && (
          <div className="govuk-panel govuk-panel--confirmation">
            <h1
              className="govuk-panel__title"
              data-cy="cy_unpublishedApplication-banner"
            >
              Grant application form unpublished
            </h1>
          </div>
        )}

        <span className="govuk-caption-l" data-cy="cyApplicationTitle">
          {grantApplicationName}
        </span>

        <h1 className="govuk-heading-l">Build an application form</h1>

        <p className="govuk-body">
          Use this service to set up an application form for your grant.
        </p>

        <p className="govuk-body">
          Applicants will use this application form to apply on{' '}
          <a
            href={findAGrantLink}
            className="govuk-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find a grant
          </a>
          {'.'}
        </p>

        <Sections
          sections={sections}
          applicationId={applicationId}
          applicationStatus={applicationStatus}
        />

        <hr className="govuk-section-break govuk-section-break--m" />

        {applicationStatus === 'PUBLISHED' ? (
          <UnpublishSummary
            applicationId={applicationId}
            grantSchemeId={grantSchemeId}
            applyToApplicationUrl={applyToApplicationUrl}
          />
        ) : (
          <PublishButton
            applicationId={applicationId}
            grantSchemeId={grantSchemeId}
            disabled={isPublishDisabled}
          />
        )}
      </div>
    </>
  );
};

export default Dashboard;
