import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import {
  Button,
  Checkboxes,
  QuestionPageGetServerSideProps,
  Table,
} from 'gap-web-ui';
import Meta from '../../components/layout/Meta';
import PaginationType from '../../types/Pagination';
import { getUserTokenFromCookies } from '../../utils/session';
import { Pagination } from '../../components/pagination/Pagination';
import styles from './superadmin-dashboard.module.scss';
import { getSuperAdminDashboard } from '../../services/SuperAdminService';
import { User } from './types';
import Navigation from './Nagivation';
import InferProps from '../../types/InferProps';
import { ButtonTypePropertyEnum } from 'gap-web-ui';
import getConfig from 'next/config';

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const paginationParams: PaginationType = {
    paginate: true,
    page: Number(context.query.page || 1) - 1,
    size: Number(context.query.limit || 10),
  };

  const userToken = getUserTokenFromCookies(context.req);
  const { departments, roles, users, userCount } = await getSuperAdminDashboard(
    paginationParams,
    userToken
  );

  const handleRequest = async (formData: FormData) => {
    console.log({ formData });
  };

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData: await getSuperAdminDashboard(paginationParams, userToken),
    handleRequest,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to filter users, please try again later.',
    onSuccessRedirectHref: `/super-admin-dashboard/`,
  });

  return {
    props: {
      // formAction,
      departments,
      roles,
      users,
      userCount,
    },
  };
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
  departments,
  roles,
  users,
  userCount,
}: // formAction,
InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Navigation />
      <div className="govuk-grid-row govuk-!-padding-top-2">
        <Meta title="Manage Users" />
        <div className="govuk-width-container">
          <main className="govuk-main-wrapper">
            <div className="govuk-grid-row">
              <div className={`${styles.sidebar} govuk-grid-column-one-third`}>
                <h2 className="govuk-heading-l">Manage users</h2>
                {/* counter */}
                <p className="govuk-body">
                  We’ve found <strong>{userCount}</strong> users
                </p>
                <form
                  noValidate
                  method="POST"
                  // action={formAction}
                  action={`${process.env.USER_SERVICE_URL}/user/filter`}
                >
                  {/* filter button */}
                  <div className={styles['top-controls']}>
                    <Button text="Clear all filters" isSecondary />
                  </div>

                  <Checkboxes
                    questionTitle="Role"
                    fieldName="role"
                    titleSize="m"
                    options={roles
                      .filter((role) => role.name !== 'FIND')
                      .map((role) => ({
                        label: role.label,
                        value: role.id,
                      }))}
                    fieldErrors={[]}
                    small
                  />

                  <Checkboxes
                    questionTitle="Department"
                    fieldName="department"
                    titleSize="m"
                    options={departments.map((department) => ({
                      label: department.name,
                      value: department.id,
                    }))}
                    fieldErrors={[]}
                    small
                  />

                  <div className={styles['bottom-controls']}>
                    <Button
                      type={ButtonTypePropertyEnum.Submit}
                      text="Apply filters"
                    />
                    {/* <Button text="Clear all filters" isSecondary /> */}
                  </div>
                </form>
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
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SuperAdminDashboard;
