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
import styles from './superadmin-dashboard.module.scss';
import { getSuperAdminDashboard } from '../../services/SuperAdminService';
import {
  SuperAdminDashboardFilterData,
  SuperAdminDashboardResponse,
  User,
} from './types';
import Navigation from './Nagivation';
import InferProps from '../../types/InferProps';
import { Pagination } from '../../components/pagination/Pagination';
import { ButtonTypePropertyEnum } from 'gap-web-ui';

const getFilterDataFromQuery = (query: GetServerSidePropsContext['query']) => {
  console.log({ query });

  const departments =
    typeof query.departments === 'string'
      ? [query.departments]
      : query.departments;
  const roles = typeof query.roles === 'string' ? [query.roles] : query.roles;
  return {
    clearAllFilters: Boolean(query.clearAllFilters),
    departments: departments || [],
    roles: roles || [],
    searchTerm: (query.searchTerm || '') as string,
  };
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const pagination: PaginationType = {
    paginate: true,
    page: Number(context.query.page || 1) - 1,
    size: Number(context.query.limit || 10),
  };

  const userToken = getUserTokenFromCookies(context.req);

  const fetchPageData = async () =>
    getSuperAdminDashboard({
      pagination,
      filterData: getFilterDataFromQuery(context.query),
      userToken,
    });

  const handleRequest = async (body: SuperAdminDashboardFilterData) => {
    if ('clear-all-filters' in body) {
      return {
        ...body,
        departments: [],
        roles: [],
        searchTerm: '',
        clearAllFilters: true,
      };
    }
    return body;
  };

  return QuestionPageGetServerSideProps<
    Omit<SuperAdminDashboardFilterData, 'clearAllFilters' | 'resetPagination'>,
    Awaited<ReturnType<typeof getSuperAdminDashboard>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to filter users, please try again later.',
    onSuccessRedirectHref: (body) =>
      `/super-admin-dashboard?roles=${body.roles || ''}&departments=${
        body.departments || ''
      }&searchTerm=${body.searchTerm || ''}&clearAllFilters=${
        body.clearAllFilters || ''
      }`,
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
  previousValues,
  pageData,
}: InferProps<typeof getServerSideProps>) => {
  const { departments, roles, userCount, users, queryParams } =
    pageData as SuperAdminDashboardResponse;

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
                <div className={styles.hidden}>
                  <Button
                    hidden={true}
                    type={ButtonTypePropertyEnum.Submit}
                    text="Search"
                  />
                </div>

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
                    <Button
                      addNameAttribute
                      text="Clear all filters"
                      isSecondary
                    />
                  </div>

                  <Checkboxes
                    useOptionValueAsInputValue
                    questionTitle="Role"
                    fieldName="roles"
                    defaultCheckboxes={queryParams.roles.map(String)}
                    titleSize="m"
                    options={roles.map((role) => ({
                      label: role.label,
                      value: String(role.id),
                    }))}
                    fieldErrors={fieldErrors}
                    small
                  />

                  <Checkboxes
                    useOptionValueAsInputValue
                    defaultCheckboxes={
                      (queryParams?.departments as string[]) || []
                    }
                    questionTitle="Department"
                    fieldName="departments"
                    titleSize="m"
                    options={departments.map((department) => ({
                      label: department.name,
                      value: String(department.id),
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
                    className={`govuk-input__wrapper ${styles['search-container']}`}
                  >
                    <input
                      className="govuk-input"
                      name="searchTerm"
                      type="text"
                      defaultValue={queryParams.searchTerm || ''}
                      placeholder="enter a keyword or search term here"
                    />
                    <Button
                      type={ButtonTypePropertyEnum.Submit}
                      text="Search"
                    />
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

                  <Pagination
                    resetPagination={queryParams.clearAllFilters}
                    additionalQueryData={{
                      ...previousValues,
                      clearAllFilters: '',
                    }}
                    itemsPerPage={10}
                    totalItems={userCount}
                  />
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
