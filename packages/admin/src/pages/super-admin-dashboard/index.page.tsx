import Meta from '../../components/layout/Meta';
import AccountDetails from '../dashboard/AccountDetails';
import ManageGrantSchemes from '../dashboard/ManageGrantSchemes';
import Scheme from '../../types/Scheme';
import { getUserSchemes } from '../../services/SchemeService';
import Pagination from '../../types/Pagination';
import { getLoggedInUsersDetails } from '../../services/UserService';
import UserDetails from '../../types/UserDetails';
import { getSessionIdFromCookies } from '../../utils/session';
import { GetServerSideProps } from 'next';
import { TextInput, Button, ValidationError, Table } from 'gap-web-ui';

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//   const paginationParams: Pagination = {
//     paginate: true,
//     page: 0,
//     size: 2,
//     sort: 'createdDate,DESC',
//   };

//   const sessionCookie = getSessionIdFromCookies(req);
//   const schemes = await getUserSchemes(paginationParams, sessionCookie);
//   const userDetails: UserDetails = await getLoggedInUsersDetails(sessionCookie);

//   return {
//     props: {
//       schemes: schemes,
//       userDetails,
//     },
//   };
// };

const SuperAdminDashboard = ({ schemes, userDetails }: DashboardProps) => {
  let fieldErrors = [] as ValidationError[];

  let temp = false;

  if (temp) {
    fieldErrors.push({
      fieldName: 'confirmation',
      errorMessage:
        'You must confirm that you understand these due-diligence checks.',
    });
  }

  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <Meta title="Super Admin Dashboard" />

      <div
        className="govuk-accordion"
        data-module="govuk-accordion"
        id="accordion-default"
      >
        <div className="govuk-accordion__section">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading">
              <span
                className="govuk-accordion__section-button"
                id="accordion-default-heading-1"
              >
                Writing well for the web
              </span>
            </h2>
          </div>
          <div
            id="accordion-default-content-1"
            className="govuk-accordion__section-content"
            aria-labelledby="accordion-default-heading-1"
          >
            <p className="govuk-body">
              This is the content for Writing well for the web.
            </p>
          </div>
        </div>
        <div className="govuk-accordion__section">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading">
              <span
                className="govuk-accordion__section-button"
                id="accordion-default-heading-2"
              >
                Writing well for specialists
              </span>
            </h2>
          </div>
          <div
            id="accordion-default-content-2"
            className="govuk-accordion__section-content"
            aria-labelledby="accordion-default-heading-2"
          >
            <p className="govuk-body">
              This is the content for Writing well for specialists.
            </p>
          </div>
        </div>
        <div className="govuk-accordion__section">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading">
              <span
                className="govuk-accordion__section-button"
                id="accordion-default-heading-3"
              >
                Know your audience
              </span>
            </h2>
          </div>
          <div
            id="accordion-default-content-3"
            className="govuk-accordion__section-content"
            aria-labelledby="accordion-default-heading-3"
          >
            <p className="govuk-body">
              This is the content for Know your audience.
            </p>
          </div>
        </div>
        <div className="govuk-accordion__section">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading">
              <span
                className="govuk-accordion__section-button"
                id="accordion-default-heading-4"
              >
                How people read
              </span>
            </h2>
          </div>
          <div
            id="accordion-default-content-4"
            className="govuk-accordion__section-content"
            aria-labelledby="accordion-default-heading-4"
          >
            <p className="govuk-body">
              This is the content for How people read.
            </p>
          </div>
        </div>
      </div>
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-third">
              <h2 className="govuk-heading-l">Manage users</h2>
              {/* counter */}
              <p className="govuk-body">
                We’ve found <strong>3,534</strong> users
              </p>

              {/* filter button */}
              <button
                className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6"
                data-module="govuk-button"
                value="true"
              >
                Clear all filters
              </button>
            </div>

            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-grid-row">
                <div className="govuk-form-group govuk-grid-column-full">
                  <TextInput
                    questionTitle={`Search results`}
                    titleSize="m"
                    fieldName=""
                    defaultValue=""
                    fieldErrors={fieldErrors}
                    TitleTag="h2"
                  >
                    <Button text="Search" />
                  </TextInput>

                  <div className="govuk-input__wrapper govuk-search-group">
                    <input
                      className="govuk-input"
                      name="searchTerm"
                      type="text"
                    />
                    {/* search button */}
                    <button
                      className="govuk-button govuk-!-margin-left-2"
                      data-module="govuk-button"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              <Table
                tHeadColumns={[
                  { name: 'Email address', width: 'one-third' },
                  { name: 'Department' },
                  { name: 'Roles' },
                  { name: 'Actions' },
                ]}
                rows={[
                  {
                    cells: [
                      {
                        content: 'test@email.com',
                      },
                      {
                        content: 'Department for Testing',
                      },
                      {
                        content: 'Admin',
                      },
                      {
                        content: 'Edit',
                      },
                    ],
                  },
                  {
                    cells: [
                      {
                        content: 'test@email.com',
                      },
                      {
                        content: 'Department for Testing',
                      },
                      {
                        content: 'Admin',
                      },
                      {
                        content: 'Edit',
                      },
                    ],
                  },
                  {
                    cells: [
                      {
                        content: 'test@email.com',
                      },
                      {
                        content: 'Department for Testing',
                      },
                      {
                        content: 'Admin',
                      },
                      {
                        content: 'Edit',
                      },
                    ],
                  },
                ]}
              ></Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface DashboardProps {
  schemes: Scheme[];
  userDetails: UserDetails;
}

export default SuperAdminDashboard;
