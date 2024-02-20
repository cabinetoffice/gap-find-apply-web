import {
  Button,
  ButtonTypePropertyEnum,
  Checkboxes,
  FlexibleQuestionPageLayout,
  Table,
} from 'gap-web-ui';
import QuestionPageGetServerSideProps from '../../utils/QuestionPageGetServerSideProps';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import Meta from '../../components/layout/Meta';
import { Pagination } from '../../components/pagination/Pagination';
import { getSuperAdminDashboard } from '../../services/SuperAdminService';
import InferProps from '../../types/InferProps';
import PaginationType from '../../types/Pagination';
import { getRedirect } from '../../utils/fetchDataOrGetRedirect';
import { getUserTokenFromCookies } from '../../utils/session';
import Navigation from './Navigation';
import styles from './superadmin-dashboard.module.scss';
import { SuperAdminDashboardFilterData, User } from './types';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query, req } = context;
  const pagination: PaginationType = {
    paginate: true,
    page: Number(query.page ?? 1) - 1,
    size: Number(query.limit ?? 10),
  };

  const fetchPageData = async (userToken: string) => {
    try {
      const filterData = {
        departments: (query.departments as string) ?? '',
        roles: (query.roles as string) ?? '',
        searchTerm: (query.searchTerm as string) ?? '',
      };

      const data = await getSuperAdminDashboard({
        pagination,
        filterData,
        userToken,
      });

      return {
        ...data,
        queryParams: {
          roles: filterData.roles.split(','),
          departments: filterData.departments.split(','),
          searchTerm: filterData.searchTerm,
        },
      };
    } catch (err: unknown) {
      return getRedirect(err);
    }
  };
  const handleRequest = async (body: SuperAdminDashboardFilterData) => body;

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getUserTokenFromCookies(req),
    onErrorMessage: 'Failed to filter users, please try again later.',
    onSuccessRedirectHref: (body) => {
      if ('clear-all-filters' in body) return `/super-admin-dashboard`;

      return `/super-admin-dashboard?roles=${encodeURIComponent(
        body.roles ?? ''
      )}&departments=${encodeURIComponent(
        body.departments ?? ''
      )}&searchTerm=${encodeURIComponent(body.searchTerm ?? '')}`;
    },
  });
};

const SuperAdminDashboard = ({
  formAction,
  csrfToken,
  fieldErrors,
  previousValues,
  pageData,
}: InferProps<typeof getServerSideProps>) => {
  const { departments, roles, userCount, users, queryParams } = pageData;

  return (
    <>
      <Navigation />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <Meta title="Manage Users" />

        <FlexibleQuestionPageLayout
          csrfToken={csrfToken}
          fieldErrors={fieldErrors}
          fullPageWidth
          formAction={formAction}
        >
          {/* Ensures hitting "Enter" submits the form. Otherwise defaults to clear all filters when pressing enter */}
          <input type="submit" hidden value="submit" />

          <div className={`${styles.sidebar} govuk-grid-column-one-third`}>
            <h2 className="govuk-heading-l">Manage users</h2>
            {/* counter */}
            <p className="govuk-body">
              We’ve found <strong>{userCount}</strong> users
            </p>

            {/* filter button */}
            <div className={styles['top-controls']}>
              <Button addNameAttribute text="Clear all filters" isSecondary />
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
              defaultCheckboxes={queryParams?.departments || []}
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
              <Button addNameAttribute text="Clear all filters" isSecondary />
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
                aria-label="Search for a user via email address"
              />

              <Button type={ButtonTypePropertyEnum.Submit} text="Search" />
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
    </>
  );
};

const convertUserDataToTableRows = (users: User[]) =>
  users.map((user) => ({
    cells: [
      { content: user.emailAddress },
      { content: user.department?.name ?? 'N/A' },
      { content: user.role?.label ?? 'Blocked' },
      {
        content: (
          <Link
            href={`/super-admin-dashboard/user/${user.gapUserId}/`}
            className="govuk-link"
          >
            Edit
          </Link>
        ),
      },
    ],
  }));

export default SuperAdminDashboard;
