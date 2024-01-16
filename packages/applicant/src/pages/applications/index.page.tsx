import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import {
  ApplicationSections,
  getApplicationsListById,
} from '../../services/ApplicationService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import moment from 'moment';
import { APPLICATION_STATUS_TAGS } from '../../utils/applicationStatusTags';
import Link from 'next/link';

export const getServerSideProps: GetServerSideProps<ApplicationsPage> = async ({
  req,
}) => {
  const applicationData = await getApplicationsListById(getJwtFromCookies(req));
  return {
    props: {
      applicationData,
    },
  };
};

const ExistingApplications = ({ applicationData }: ApplicationsPage) => {
  const { publicRuntimeConfig } = getConfig();
  const hasApplicationData = applicationData.length > 0;

  return (
    <>
      <Meta title="View my applications - Apply for a grant" />
      <Layout backBtnUrl={routes.dashboard}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
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
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th
                      scope="col"
                      className="govuk-table__header"
                      data-cy="cy-grant-table-header-name"
                    >
                      Grant
                    </th>
                    <th
                      scope="col"
                      className="govuk-table__header"
                      data-cy="cy-grant-table-header-status"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="govuk-table__header"
                      data-cy="cy-grant-table-header-submitted-date"
                    >
                      Submitted
                    </th>
                    <th
                      scope="col"
                      className="govuk-table__header"
                      data-cy="cy-grant-table-header-actions"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {applicationData.map(ApplicationRow)}
                </tbody>
              </table>
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

const ApplicationRow = (application) => {
  const applicationName = application.applicationName;
  const submissionId = application.grantSubmissionId;
  const applicationStatusTag =
    APPLICATION_STATUS_TAGS[application.submissionStatus];
  const isSubmitted = application.submissionStatus === 'SUBMITTED';
  const applicationLinkText = isSubmitted ? 'View' : 'Edit';
  const applicationLink = isSubmitted
    ? '/apply/applicant' + routes.submissions.summary(submissionId)
    : '/apply/applicant' + routes.submissions.sections(submissionId);
  return (
    <tr key={submissionId} className="govuk-table__row">
      <th scope="row" className="govuk-table__cell">
        <p
          className="govuk-!-margin-0 govuk-!-font-weight-bold"
          data-cy={`cy-application-link-${applicationName}`}
        >
          {applicationName}
        </p>
      </th>
      <td
        scope="row"
        className="govuk-table__cell"
        aria-describedby={`status-tag-${submissionId}`}
      >
        <strong
          className={`govuk-tag ${applicationStatusTag.colourClass}`}
          data-cy={`cy-status-tag-${applicationName}-${applicationStatusTag.displayName}`}
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
          data-cy={`cy-application-submitted-date-${applicationName}`}
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
        {application.submissionStatus === 'GRANT_CLOSED' ? (
          '-'
        ) : (
          <Link href={applicationLink}>
            <a
              className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
              data-cy={`cy-application-link-${applicationName}`}
              id={`application-link-${submissionId}`}
            >
              {applicationLinkText}
            </a>
          </Link>
        )}
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
  grantApplicationId: string;
  submissionStatus: string;
  submittedDate: string;
  sections: ApplicationSections[];
}

export default ExistingApplications;
