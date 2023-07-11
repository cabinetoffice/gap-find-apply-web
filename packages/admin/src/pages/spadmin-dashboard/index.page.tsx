import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { Button, Checkboxes, Table } from 'gap-web-ui';
import Meta from '../../components/layout/Meta';
import PaginationType from '../../types/Pagination';
import { getSessionIdFromCookies } from '../../utils/session';
import { Pagination } from '../../components/pagination/Pagination';
import styles from './spadmin-dashboard.module.scss';
import { Department, Role, User } from './types';
import Navigation from './Nagivation';

let count = 0;

export const users = new Array(10).fill(undefined).map(() => ({
  id: count,
  email: `test${count++}@email.com`,
  sub: '1234567',
  roles:
    Math.random() > 0.33
      ? [
          { id: 0, name: 'FIND' },
          { id: 1, name: 'APPLY' },
        ]
      : [
          { id: 0, name: 'FIND' },
          { id: 1, name: 'APPLY' },
          { id: 2, name: 'ADMIN' },
        ],
  department: {
    id: 0,
    name: 'Super cool dept',
  },
}));

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const paginationParams: PaginationType = {
    paginate: true,
    page: 0,
    size: 10,
  };

  const sessionCookie = getSessionIdFromCookies(req);
  // const schemes = await getUserSchemes(paginationParams, sessionCookie);
  // const userDetails: UserDetails = await getLoggedInUsersDetails(sessionCookie);

  return {
    props: {
      users,
      noOfUsersFound: 1234,
    },
  };
};

const convertUserDataToTableProps = (users: User[]) =>
  users.map((user) => ({
    cells: [
      { content: user.email },
      { content: user.department.name },
      {
        content: user.roles
          .map(
            (role) => role.name.charAt(0) + role.name.substring(1).toLowerCase()
          )
          .join(', '),
      },
      {
        content: (
          <Link href={`/spadmin-dashboard/user/${user.id}/`}>
            <a className="govuk-link">Edit</a>
          </Link>
        ),
      },
    ],
  }));

const SuperAdminDashboard = ({ noOfUsersFound, users }: DashboardProps) => {
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
                  We’ve found <strong>{noOfUsersFound}</strong> users
                </p>
                {/* filter button */}
                <div className={styles['top-controls']}>
                  <Button text="Clear all filters" isSecondary />
                </div>
                <Checkboxes
                  questionTitle="Role"
                  fieldName="role"
                  titleSize="m"
                  options={['Super admin', 'Admin', 'Apply', 'Find']}
                  fieldErrors={[]}
                  small
                />
                <Checkboxes
                  questionTitle="Department"
                  fieldName="department"
                  titleSize="m"
                  options={[
                    'Some dept',
                    'Some other dept',
                    'This data is made up',
                  ]}
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
                    { name: 'Email address', width: 'one-third' },
                    { name: 'Department' },
                    { name: 'Roles' },
                    { name: 'Actions' },
                  ]}
                  rows={convertUserDataToTableProps(users)}
                />
                <Pagination itemsPerPage={10} totalItems={noOfUsersFound} />
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
  noOfUsersFound: number;
}

export default SuperAdminDashboard;
