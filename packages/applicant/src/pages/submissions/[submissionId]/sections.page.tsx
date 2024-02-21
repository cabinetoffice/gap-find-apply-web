import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Link from 'next/link';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import { GrantSchemeService } from '../../../services/GrantSchemeService';
import {
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  isSubmissionReady,
  SectionData,
} from '../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { SUBMISSION_STATUS_TAGS } from '../../../utils/sectionStatusTags';
import styles from './sections.module.scss';
import { getApplicationStatusBySchemeId } from '../../../services/ApplicationService';

const { publicRuntimeConfig } = getConfig();

export interface SubmissionSectionPage {
  sections: SectionData[];
  grantSubmissionId: string;
  applicationName: string;
  isSubmissionReady: boolean;
  hasSubmissionBeenSubmitted: boolean;
  supportEmail: string;
  csrfToken: string;
}

export const getServerSideProps: GetServerSideProps<
  SubmissionSectionPage
> = async ({ req, res, params }) => {
  const submissionId = params.submissionId.toString();

  const { sections, grantSubmissionId, applicationName, grantSchemeId } =
    await getSubmissionById(submissionId, getJwtFromCookies(req));

  const grantApplicationStatus = await getApplicationStatusBySchemeId(
    grantSchemeId,
    getJwtFromCookies(req)
  );

  const submissionReady = await isSubmissionReady(
    submissionId,
    getJwtFromCookies(req)
  );
  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(
    submissionId,
    getJwtFromCookies(req)
  );
  const grantSchemeService = GrantSchemeService.getInstance();
  const { grantScheme } = await grantSchemeService.getGrantSchemeById(
    grantSchemeId,
    getJwtFromCookies(req)
  );

  if (hasBeenSubmitted) {
    return {
      redirect: {
        destination: `/applications`,
        permanent: false,
      },
    };
  }

  const questionData = await getQuestionById(
    submissionId,
    'ELIGIBILITY',
    'ELIGIBILITY',
    getJwtFromCookies(req)
  );

  return {
    props: {
      sections,
      grantSubmissionId,
      applicationName,
      isSubmissionReady: submissionReady,
      hasSubmissionBeenSubmitted: hasBeenSubmitted,
      supportEmail: grantScheme.email || '',
      csrfToken: res.getHeader('x-csrf-token') as string,
      eligibilityCheckPassed: questionData?.question?.response === 'Yes',
    },
  };
};

export default function SubmissionSections({
  sections,
  grantSubmissionId,
  applicationName,
  isSubmissionReady,
  hasSubmissionBeenSubmitted,
  csrfToken,
  supportEmail,
  eligibilityCheckPassed,
}) {
  const getSectionUrl = (sectionId: string) => {
    switch (sectionId) {
      case 'ORGANISATION_DETAILS':
      case 'FUNDING_DETAILS': {
        return routes.submissions.section(grantSubmissionId, sectionId);
      }
      default: {
        return routes.api.submissions.section(grantSubmissionId, sectionId);
      }
    }
  };

  return (
    <>
      <Meta title="My application - Apply for a grant" />
      <Layout backBtnUrl={routes.applications}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form
              action={
                publicRuntimeConfig.subPath +
                routes.submissions.summary(grantSubmissionId)
              }
              method="POST"
            >
              <span
                className="govuk-caption-l"
                data-cy={`cy-application-name-${applicationName}`}
              >
                {applicationName}
              </span>
              <h1 className="govuk-heading-l" data-cy="cy-application-header">
                Your Application
              </h1>
              <p className="govuk-body" data-cy="cy-application-help-text">
                How the application form works
              </p>
              <ul className="govuk-list govuk-list--bullet">
                <li data-cy="cy-application-help-text-bullet-1">
                  you must complete each section of the application form
                </li>
                <li data-cy="cy-application-help-text-bullet-2">
                  once all sections are complete you can submit your application
                </li>
                <li data-cy="cy-application-help-text-bullet-3">
                  you can save your application and come back to it later
                </li>
              </ul>
              <Link
                href={routes.submissions.sectionOverview(grantSubmissionId)}
                className="govuk-body govuk-link govuk-link--no-visited-state "
                data-cy="cy-section-summary-link"
              >
                See an overview of the questions you will be asked
              </Link>
              <div className="govuk-!-padding-bottom-5" />
              <dl className="govuk-summary-list">
                {sections &&
                  sections.map((section: SectionData, index: number) => {
                    return (
                      <div className="govuk-summary-list__row" key={index}>
                        <dt className="govuk-summary-list__key">
                          {section.sectionId === 'ELIGIBILITY' ||
                          eligibilityCheckPassed ? (
                            <Link
                              href={getSectionUrl(section.sectionId)}
                              className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
                              data-cy={`cy-section-title-link-${section.sectionTitle}`}
                            >
                              {section.sectionTitle}
                            </Link>
                          ) : (
                            <p
                              className="govuk-!-margin-0 govuk-!-font-weight-regular"
                              data-cy={`cy-section-title-link-${section.sectionTitle}`}
                            >
                              {section.sectionTitle}
                            </p>
                          )}
                        </dt>
                        <dt className="govuk-!-text-align-right">
                          <strong
                            className={`govuk-tag ${
                              SUBMISSION_STATUS_TAGS[section.sectionStatus]
                                .colourClass
                            }`}
                            data-cy={`cy-status-tag-${section.sectionTitle}-${
                              SUBMISSION_STATUS_TAGS[section.sectionStatus]
                                .displayName
                            }`}
                          >
                            {
                              SUBMISSION_STATUS_TAGS[section.sectionStatus]
                                .displayName
                            }
                          </strong>
                        </dt>
                      </div>
                    );
                  })}
              </dl>
              <input type="hidden" name="_csrf" value={csrfToken} />
              <div className="govuk-button-group">
                {!isSubmissionReady || hasSubmissionBeenSubmitted ? (
                  <button
                    className="govuk-button"
                    data-module="govuk-button"
                    disabled={true}
                    data-cy="cy-submit-application-button"
                  >
                    Review and submit
                  </button>
                ) : (
                  <a
                    href={
                      publicRuntimeConfig.subPath +
                      routes.submissions.summary(grantSubmissionId)
                    }
                    role="button"
                    draggable="false"
                    className="govuk-button"
                    data-module="govuk-button"
                    data-cy="cy-submit-application-link"
                  >
                    Review and submit
                  </a>
                )}

                <Link
                  href="/applications"
                  className="govuk-link govuk-link--no-visited-state"
                  data-cy="cy-save-and-come-back-later"
                >
                  Save and come back later
                </Link>
              </div>
            </form>
          </div>
          {supportEmail && (
            <div className="govuk-grid-column-one-third ">
              <hr
                className={`govuk-section-break govuk-section-break--m govuk-section-break--visible ${styles.breakLine}`}
              />
              <h2 className="govuk-heading-m">Help and support</h2>
              <p className="govuk-body">
                If you have a question about this grant, contact:
              </p>
              <p className="govuk-body">
                <a
                  href={`mailto:${supportEmail}`}
                  className={styles.wrapper}
                  data-cy="cy-support-email"
                >
                  {supportEmail}
                </a>
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
