import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Button, Checkboxes, Table } from 'gap-web-ui';
import Meta from '../../components/layout/Meta';
import PaginationType from '../../types/Pagination';
import { getUserTokenFromCookies } from '../../utils/session';
import { Pagination } from '../../components/pagination/Pagination';
import styles from './superadmin-dashboard.module.scss';
import { getSuperAdminDashboard } from '../../services/SuperAdminService';
import { Department, Role, User } from './types';
import Navigation from './Nagivation';
import { toSentenceCase } from './utils';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const paginationParams: PaginationType = {
    paginate: true,
    page: Number(query.page) - 1,
    size: Number(query.limit),
  };

  const userToken = getUserTokenFromCookies(req);
  const { departments, roles, users, userCount } = await getSuperAdminDashboard(
    paginationParams,
    userToken
  );

  return {
    props: {
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
      {
        content: user.roles
          ?.map((role) => toSentenceCase(role.name))
          .join(', '),
      },
      {
        content: (
          <Link href={`/super-admin-dashboard/user/${user.gapUserId}/`}>
            <a className="govuk-link">Edit</a>
          </Link>
        ),
      },
    ],
  }));

const convertEnumToCheckboxOptions = (
  {
    id,
    name,
  }: {
    id: string;
    name: string;
  },
  { useSentenceCase = false } = {}
) => ({
  label: useSentenceCase ? toSentenceCase(name) : name,
  value: id,
});

const SuperAdminDashboard = ({
  departments,
  roles,
  users,
  userCount,
}: DashboardProps) => {
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
                {/* filter button */}
                <div className={styles['top-controls']}>
                  <Button text="Clear all filters" isSecondary />
                </div>
                <Checkboxes
                  questionTitle="Role"
                  fieldName="role"
                  titleSize="m"
                  options={roles.map((role) =>
                    convertEnumToCheckboxOptions(role, {
                      useSentenceCase: true,
                    })
                  )}
                  fieldErrors={[]}
                  small
                />
                <Checkboxes
                  questionTitle="Department"
                  fieldName="department"
                  titleSize="m"
                  options={departments.map((role) =>
                    convertEnumToCheckboxOptions(role)
                  )}
                  fieldErrors={[]}
                  small
                />
                <div className={styles['bottom-controls']}>
                  <Button text="Apply filters" />
                  <Button text="Clear all filters" isSecondary />
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

interface DashboardProps {
  departments: Department[];
  roles: Role[];
  users: User[];
  userCount: number;
}

export default SuperAdminDashboard;
