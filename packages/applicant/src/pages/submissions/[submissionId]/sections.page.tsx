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
import { initiateCSRFCookie } from '../../../utils/csrf';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { SUBMISSION_STATUS_TAGS } from '../../../utils/sectionStatusTags';
import styles from './sections.module.scss';
import { ImportantBanner } from 'gap-web-ui';

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
> = async ({ req, res, params, query }) => {
  const submissionId = params.submissionId.toString();

  const { sections, grantSubmissionId, applicationName, grantSchemeId } =
    await getSubmissionById(submissionId, getJwtFromCookies(req));

  const submissionReady = await isSubmissionReady(
    submissionId,
    getJwtFromCookies(req)
  );
  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(
    submissionId,
    getJwtFromCookies(req)
  );
  const grantSchemeService = GrantSchemeService.getInstance();
  const { email: supportEmail } = await grantSchemeService.getGrantSchemeById(
    grantSchemeId,
    getJwtFromCookies(req)
  );

  await initiateCSRFCookie(req, res);

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

  const migrationStatus = query?.migrationStatus ?? null;
  const oneLoginTransferErrorEnabled =
    process.env.ONE_LOGIN_MIGRATION_JOURNEY_ENABLED === 'true';
  const showMigrationSuccessBanner =
    oneLoginTransferErrorEnabled && migrationStatus === 'success';
  const showMigrationErrorBanner =
    oneLoginTransferErrorEnabled && migrationStatus === 'error';

  return {
    props: {
      showMigrationSuccessBanner,
      showMigrationErrorBanner,
      sections,
      grantSubmissionId,
      applicationName,
      isSubmissionReady: submissionReady,
      hasSubmissionBeenSubmitted: hasBeenSubmitted,
      supportEmail,
      csrfToken: (req as any).csrfToken?.() || '',
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
  showMigrationSuccessBanner,
  showMigrationErrorBanner,
}) {
  return (
    <>
      <Meta title="My application - Apply for a grant" />
      <Layout backBtnUrl={routes.applications}>
        {showMigrationSuccessBanner && (
          <ImportantBanner
            bannerHeading="Your data has been successfully added to your One Login account."
            isSuccess
          />
        )}

        {showMigrationErrorBanner && (
          <ImportantBanner
            bannerHeading="Something went wrong while transferring your data. "
            bannerContent={
              <p className="govuk-body">
                Please get in contact with our support team at{' '}
                <a
                  className="govuk-notification-banner__link"
                  href="mailto:findagrant@cabinetoffice.gov.uk"
                >
                  findagrant@cabinetoffice.gov.uk
                </a>
                {'.'}
              </p>
            }
          />
        )}

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form
              action={
                publicRuntimeConfig.subPath +
                `/submissions/${grantSubmissionId}/submit`
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

              <dl className="govuk-summary-list">
                {sections &&
                  sections.map((section: SectionData, index: number) => {
                    return (
                      <div className="govuk-summary-list__row" key={index}>
                        <dt className="govuk-summary-list__key">
                          {section.sectionId === 'ELIGIBILITY' ||
                          eligibilityCheckPassed ? (
                            <Link
                              href={routes.api.submissions.section(
                                grantSubmissionId,
                                section.sectionId
                              )}
                            >
                              <a
                                className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
                                data-cy={`cy-section-title-link-${section.sectionTitle}`}
                              >
                                {section.sectionTitle}
                              </a>
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
                    Submit application
                  </button>
                ) : (
                  <a
                    href={`${publicRuntimeConfig.subPath}/submissions/${grantSubmissionId}/submit`}
                    role="button"
                    draggable="false"
                    className="govuk-button"
                    data-module="govuk-button"
                    data-cy="cy-submit-application-link"
                  >
                    Submit application
                  </a>
                )}

                <Link href="/applications">
                  <a
                    className="govuk-link govuk-link--no-visited-state"
                    data-cy="cy-save-and-come-back-later"
                  >
                    Save and come back later
                  </a>
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
