import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import {
  getApplicationFormSummary,
  handleSectionOrdering,
} from '../../../services/ApplicationService';
import { getGrantScheme } from '../../../services/SchemeService';
import ServiceError from '../../../types/ServiceError';
import { getSessionIdFromCookies } from '../../../utils/session';
import PublishButton from './components/PublishButton';
import Sections from './components/Sections';
import UnpublishSummary from './components/UnpublishSummary';
import InferProps from '../../../types/InferProps';
import callServiceMethod from '../../../utils/callServiceMethod';
import { generateErrorPageParams } from '../../../utils/serviceErrorHelpers';
import { useEffect, useState, useRef } from 'react';

export const getServerSideProps = async ({
  params,
  query,
  res,
  req,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { applicationId } = params as Record<string, string>;
  const { recentlyUnpublished, scrollPosition } = query as Record<
    string,
    string
  >;

  const result = await callServiceMethod(
    req,
    res,
    async (body) => {
      const sessionId = getSessionIdFromCookies(req);
      const params = Object.keys(body)[0].split('/');
      const increment = params[0] === 'Up' ? -1 : 1;
      const sectionId = params[1];
      await handleSectionOrdering(
        increment,
        sectionId,
        applicationId,
        sessionId
      );
    },
    `/build-application/${applicationId}/dashboard?scrollPosition=${scrollPosition}`,
    generateErrorPageParams(
      'Something went wrong while trying to update section orders.',
      `/build-application/${applicationId}/dashboard`
    )
  );

  if ('redirect' in result) {
    return result;
  }

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
      resolvedUrl: process.env.SUB_PATH + resolvedUrl,
      csrfToken: res.getHeader('x-csrf-token') as string,
      scrollPosition: Number(scrollPosition ?? 0),
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
  resolvedUrl,
  csrfToken,
  scrollPosition,
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

  const formRef = useRef<HTMLFormElement>(null);
  const [newScrollPosition, setNewScrollPosition] = useState(
    scrollPosition ?? 0
  );
  const formAction =
    resolvedUrl.split('?')[0] + `?scrollPosition=${newScrollPosition}`;

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({
        top: scrollPosition,
        behavior: 'instant' as ScrollBehavior,
      });
    }, 10);
  }, []);

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
          formAction={formAction}
          csrfToken={csrfToken}
          setNewScrollPosition={setNewScrollPosition}
          formRef={formRef}
        />

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
