import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import {
  Button,
  Checkboxes,
  FlexibleQuestionPageLayout,
  QuestionPageGetServerSideProps,
  Table,
} from 'gap-web-ui';
import Meta from '../../components/layout/Meta';
import PaginationType from '../../types/Pagination';
import { getUserTokenFromCookies } from '../../utils/session';
import { Pagination } from '../../components/pagination/Pagination';
import styles from './superadmin-dashboard.module.scss';
import {
  filterUsers,
  getSuperAdminDashboard,
} from '../../services/SuperAdminService';
import {
  SuperAdminDashboardFilterData,
  SuperAdminDashboardResponse,
  User,
} from './types';
import Navigation from './Nagivation';
import InferProps from '../../types/InferProps';
import getConfig from 'next/config';

const formatRequestBody = (body: SuperAdminDashboardFilterData) => {
  if (typeof body.roles === 'string') body.roles = [body.roles];
  if (typeof body.departments === 'string')
    body.departments = [body.departments];
  if (!body.departments) body.departments = [];
  if (!body.roles) body.roles = [];

  const clearAllFilters = body['clear-all-filters'] === '' ? true : false;
  return {
    ...body,
    clearAllFilters,
  };
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const paginationParams: PaginationType = {
    paginate: true,
    page: Number(context.query.page || 1) - 1,
    size: Number(context.query.limit || 10),
  };

  const userToken = getUserTokenFromCookies(context.req);

  const fetchPageData = async () =>
    await getSuperAdminDashboard(paginationParams, userToken);

  const handleRequest = async (body: SuperAdminDashboardFilterData) => {
    const res = await filterUsers(
      paginationParams,
      formatRequestBody(body),
      userToken
    );
    return res;
  };

  return QuestionPageGetServerSideProps<
    Omit<SuperAdminDashboardFilterData, 'clearAllFilters'>,
    Awaited<ReturnType<typeof getSuperAdminDashboard>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to filter users, please try again later.',
    useHandleRequestForPageData: true,
    onSuccessRedirectHref: `/super-admin-dashboard`,
  });
};

const convertUserDataToTableRows = (users: User[]) =>
  users.map((user) => ({
    cells: [
      { content: user.emailAddress },
      { content: user.department?.name || 'N/A' },
      { content: user.role?.label || 'N/A' },
      {
        content: (
          <Link href={`/super-admin-dashboard/user/${user.gapUserId}/`}>
            <a className="govuk-link">Edit</a>
          </Link>
        ),
      },
    ],
  }));

const SuperAdminDashboard = ({
  formAction,
  csrfToken,
  fieldErrors,
  pageData,
}: InferProps<typeof getServerSideProps>) => {
  const { departments, roles, userCount, users, previousFilterData } =
    pageData as SuperAdminDashboardResponse;

  const {
    0: previousDepartments,
    1: previousRoles,
    2: previousSearchTerm,
  } = previousFilterData || {};
  return (
    <>
      <Navigation />
      <div className="govuk-grid-row govuk-!-padding-top-2">
        <Meta title="Manage Users" />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper">
            <div className="govuk-grid-row">
              <FlexibleQuestionPageLayout
                csrfToken={csrfToken}
                fieldErrors={fieldErrors}
                fullPageWidth
                formAction={formAction}
              >
                <div
                  className={`${styles.sidebar} govuk-grid-column-one-third`}
                >
                  <h2 className="govuk-heading-l">Manage users</h2>
                  {/* counter */}
                  <p className="govuk-body">
                    We’ve found <strong>{userCount}</strong> users
                  </p>

                  {/* filter button */}
                  <div className={styles['top-controls']}>
                    <Button text="Clear all filters" isSecondary />
                  </div>

                  <Checkboxes
                    useOptionValueAsInputValue
                    questionTitle="Role"
                    fieldName="roles"
                    defaultCheckboxes={previousRoles || []}
                    titleSize="m"
                    options={roles
                      .filter((role) => role.name !== 'FIND')
                      .map((role) => ({
                        label: role.label,
                        value: role.id,
                      }))}
                    fieldErrors={fieldErrors}
                    small
                  />

                  <Checkboxes
                    useOptionValueAsInputValue
                    defaultCheckboxes={previousDepartments || []}
                    questionTitle="Department"
                    fieldName="departments"
                    titleSize="m"
                    options={departments.map((department) => ({
                      label: department.name,
                      value: department.id,
                    }))}
                    fieldErrors={fieldErrors}
                    small
                  />

                  <div className={styles['bottom-controls']}>
                    <Button text="Apply filters" />
                    <Button
                      addNameAttribute
                      text="Clear all filters"
                      isSecondary
                    />
                  </div>
                </div>

                <div className="govuk-grid-column-two-thirds">
                  <div
                    className="govuk-input__wrapper"
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <input
                      className="govuk-input"
                      name="searchTerm"
                      type="text"
                      defaultValue={previousSearchTerm || ''}
                      placeholder="enter a keyword or search term here"
                    />
                    <Button text="Search" />
                  </div>

                  <Table
                    tHeadColumns={[
                      { name: 'Email address', wrapText: true },
                      { name: 'Department' },
                      { name: 'Roles' },
                      { name: 'Actions' },
                    ]}
                    rows={convertUserDataToTableRows(users)}
                  />

                  <Pagination itemsPerPage={10} totalItems={userCount} />
                </div>
              </FlexibleQuestionPageLayout>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
