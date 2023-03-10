import { GetServerSideProps } from 'next';
import React from 'react';
import Meta from '../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../../../types/ApplicationForm';
import ServiceError from '../../../types/ServiceError';
import Sections from './components/Sections';
import PublishButton from './components/PublishButton';
import UnpublishSummary from './components/UnpublishSummary';
import CustomLink from '../../../components/custom-link/CustomLink';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  query,
  req,
}) => {
  const { applicationId } = params as Record<string, string>;
  const { recentlyUnpublished } = query;

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
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

  return {
    props: {
      sections: applicationFormSummary.sections,
      grantApplicationName: applicationFormSummary.applicationName,
      applicationId: applicationFormSummary.grantApplicationId,
      grantSchemeId: applicationFormSummary.grantSchemeId,
      applicationStatus: applicationFormSummary.applicationStatus,
      recentlyUnpublished: !!recentlyUnpublished,
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
}: DashboardProps) => {
  const findAGrantLink = (
    <a
      href="https://www.find-government-grants.service.gov.uk/"
      className="govuk-link"
    >
      Find a grant
    </a>
  );

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
          Applicants will use this application form to apply on {findAGrantLink}
          .
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

interface DashboardProps {
  sections: ApplicationFormSection[];
  grantApplicationName: string;
  applicationId: string;
  grantSchemeId: string;
  applicationStatus: ApplicationFormSummary['applicationStatus'];
  recentlyUnpublished: boolean;
}

export default Dashboard;
