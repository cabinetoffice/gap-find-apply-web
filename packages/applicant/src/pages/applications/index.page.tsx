import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import {
  ApplicationSections,
  getApplicationsListById,
} from '../../services/ApplicationService';
import { getJwtFromCookies } from '../../utils/jwt';
import { routes } from '../../utils/routes';
import getConfig from 'next/config';

export const getServerSideProps: GetServerSideProps<ApplicationsPage> = async ({
  req,
  res,
}) => {
  const applicationData = await getApplicationsListById(getJwtFromCookies(req));
  return {
    props: {
      applicationData: applicationData,
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

            {hasApplicationData && (
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th
                      scope="col"
                      className="govuk-table__header"
                      data-cy="cy-grant-table-header"
                    >
                      Name of grant
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {applicationData.map((application) => {
                    return (
                      <tr
                        key={application.grantSubmissionId}
                        className="govuk-table__row"
                      >
                        <th scope="row" className="govuk-table__cell">
                          {application.submissionStatus === 'SUBMITTED' ? (
                            <p
                              className="govuk-!-margin-0 govuk-!-font-weight-regular"
                              data-cy={`cy-application-link-${application.applicationName}`}
                            >
                              {application.applicationName}
                            </p>
                          ) : (
                            <Link
                              href={routes.submissions.sections(
                                application.grantSubmissionId
                              )}
                            >
                              <a
                                className="govuk-link govuk-link--no-visited-state govuk-!-font-weight-regular"
                                data-cy={`cy-application-link-${application.applicationName}`}
                              >
                                {application.applicationName}
                              </a>
                            </Link>
                          )}
                        </th>

                        {/* Left in to stop AXE accessibility warnings */}
                        <td className="govuk-table__cell"></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!hasApplicationData && (
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

export interface ApplicationsPage {
  applicationData: ApplicationsList[];
}

export interface ApplicationsList {
  grantSubmissionId: string;
  grantSchemeId: string;
  applicationName: string;
  grantApplicationId: string;
  submissionStatus: string;
  sections: ApplicationSections[];
}

export default ExistingApplications;
