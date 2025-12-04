import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import {
  ApplicationSections,
  getApplicationsListById,
  getApplicationStatusBySchemeId,
} from '../../services/ApplicationService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import moment from 'moment';
import { APPLICATION_STATUS_TAGS } from '../../utils/applicationStatusTags';

export const getServerSideProps: GetServerSideProps<ApplicationsPage> = async ({
  req,
}) => {
  const jwt = getJwtFromCookies(req);
  let applicationData = await getApplicationsListById(jwt);

  // Transform backend response to match frontend interface
  // Backend returns: grantSchemeId (Integer), grantApplicationId (Integer),
  // grantSubmissionId (UUID), submissionStatus (enum), submittedDate (ZonedDateTime)
  applicationData = applicationData.map((application: any) => {
    return {
      grantSchemeId: String(application.grantSchemeId ?? ''),
      grantApplicationId: String(application.grantApplicationId ?? ''),
      grantSubmissionId: String(application.grantSubmissionId ?? ''),
      applicationName: application.applicationName ?? '',
      submissionName: application.submissionName ?? null,
      submissionStatus: String(application.submissionStatus ?? 'IN_PROGRESS'),
      submittedDate: application.submittedDate ?? '',
      sections: application.sections ?? [],
    };
  });

  applicationData = await Promise.all(
    applicationData.map(async (application) => {
      return {
        ...application,
        grantApplicationStatus: await getApplicationStatusBySchemeId(
          application.grantSchemeId,
          jwt
        ),
      };
    })
  );
  return {
    props: {
      applicationData,
    },
  };
};

const ExistingApplications = ({ applicationData }: ApplicationsPage) => {
  const { publicRuntimeConfig } = getConfig();
  const hasApplicationData = applicationData.length > 0;

  // Group submissions by grant name (applicationName)
  const groupedByGrant = applicationData.reduce((acc, application) => {
    const applicationName = application.applicationName || 'Untitled Grant';
    if (!acc[applicationName]) {
      acc[applicationName] = [];
    }
    acc[applicationName].push(application);
    return acc;
  }, {} as Record<string, typeof applicationData>);

  const grantGroups = Object.entries(groupedByGrant);

  return (
    <>
      <Meta title="View my applications - Apply for a grant" />
      <Layout backBtnUrl={routes.dashboard}>
        <div className="govuk-grid-row">
          <div className="govuk-!-width-full">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cy-your-applications-header"
            >
              Your applications
            </h1>
            <p
              className="govuk-body"
              data-cy="cy-your-applications-description"
            >
              All of your current and past applications are listed below.
            </p>

            {hasApplicationData ? (
              grantGroups.map(([applicationName, submissions]) => (
                <div key={applicationName} className="govuk-!-margin-bottom-6">
                  <h2 className="govuk-heading-m">{applicationName}</h2>
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th
                          scope="col"
                          className="govuk-table__header govuk-!-width-one-quarter"
                          data-cy="cy-grant-table-header-submitted-for"
                        >
                          Application Name
                        </th>
                        <th
                          scope="col"
                          className="govuk-table__header govuk-!-width-one-quarter"
                          data-cy="cy-grant-table-header-status"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="govuk-table__header govuk-!-width-one-quarter"
                          data-cy="cy-grant-table-header-submitted-date"
                        >
                          Submitted
                        </th>
                        <th
                          scope="col"
                          className="govuk-table__header govuk-!-width-one-quarter"
                          data-cy="cy-grant-table-header-actions"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {submissions.map((application) => (
                        <ApplicationRow
                          key={application.grantSubmissionId}
                          application={application}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ))
            ) : (
              <>
                <hr
                  className="govuk-section-break govuk-section-break--visible govuk-section-break--m govuk-!-margin-top-7"
                  data-testid="horizontal-line"
                ></hr>
                <p className="govuk-body">
                  You have not started any applications.
                </p>
                <p className="govuk-body">
                  To get started, you need to find a grant that you want to
                  apply for.
                </p>
                <hr className="govuk-section-break govuk-section-break--m" />
                <a
                  className="govuk-link govuk-!-font-size-19"
                  href={publicRuntimeConfig.FIND_A_GRANT_URL}
                >
                  Find a grant
                </a>
              </>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

const ApplicationRow = (applicationProps: ApplicationRowProps) => {
  const application = applicationProps.application;
  const displayName =
    application.submissionName ||
    application.applicationName ||
    'Untitled Application';
  const submissionId = application.grantSubmissionId;
  const isRemovedAndNotSubmitted =
    application.grantApplicationStatus === 'REMOVED' &&
    application.submissionStatus !== 'SUBMITTED';
  const submissionStatus = isRemovedAndNotSubmitted
    ? 'GRANT_CLOSED'
    : application.submissionStatus || 'IN_PROGRESS';
  const applicationStatusTag =
    APPLICATION_STATUS_TAGS[submissionStatus] ||
    APPLICATION_STATUS_TAGS.IN_PROGRESS;
  const isInProgress = submissionStatus === 'IN_PROGRESS';
  const applicationLinkText = isInProgress ? 'Edit' : 'View';
  const applicationLink = isInProgress
    ? '/apply/applicant' + routes.submissions.sections(submissionId)
    : '/apply/applicant' + routes.submissions.summary(submissionId);
  return (
    <tr key={submissionId} className="govuk-table__row">
      <th scope="row" className="govuk-table__cell">
        <p
          className="govuk-!-margin-0 govuk-!-font-weight-bold"
          data-cy={`cy-application-link-${displayName}`}
        >
          {displayName}
        </p>
      </th>
      <td
        scope="row"
        className="govuk-table__cell"
        aria-describedby={`status-tag-${submissionId}`}
      >
        <strong
          className={`govuk-tag ${applicationStatusTag.colourClass}`}
          data-cy={`cy-status-tag-${displayName}-${applicationStatusTag.displayName}`}
          id={`status-tag-${submissionId}`}
        >
          {applicationStatusTag.displayName}
        </strong>
      </td>
      <td
        scope="row"
        className="govuk-table__cell"
        aria-describedby={`submitted-date-${submissionId}`}
      >
        <p
          className="govuk-!-margin-0 govuk-!-font-weight-normal"
          data-cy={`cy-application-submitted-date-${displayName}`}
          id={`submitted-date-${submissionId}`}
        >
          {application.submittedDate
            ? moment(application.submittedDate).format('D MMMM YYYY')
            : '-'}
        </p>
      </td>
      <td
        scope="row"
        className="govuk-table__cell"
        aria-describedby={`application-link-${submissionId}`}
      >
        <a
          href={applicationLink}
          className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
          data-cy={`cy-application-link-${displayName}`}
          id={`application-link-${submissionId}`}
        >
          {applicationLinkText}
        </a>
      </td>

      {/* Left in to stop AXE accessibility warnings */}
      <td className="govuk-table__cell"></td>
    </tr>
  );
};

export interface ApplicationsPage {
  applicationData: ApplicationsList[];
}

export interface ApplicationsList {
  grantSubmissionId: string;
  grantSchemeId: string;
  applicationName: string;
  submissionName?: string | null;
  grantApplicationId: string;
  submissionStatus: string;
  submittedDate: string;
  sections: ApplicationSections[];
}

type ApplicationRowProps = {
  application: ApplicationsList & {
    grantApplicationStatus?: string;
  };
};

export default ExistingApplications;
