import { Button, ButtonTypePropertyEnum, Checkboxes, Table } from 'gap-web-ui';
import { Metadata } from 'next';
import styles from './superadmin-dashboard.module.scss';
import { getSuperAdminDashboard } from '../../services/SuperAdminService';
import { cookies, headers } from 'next/headers';
import { User } from '../../pages/super-admin-dashboard/types';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Navigation from './Navigation';
import { Pagination } from '../../components/pagination/Pagination';

export const metadata: Metadata = {
  title: 'Manage Users',
};

export type SuperAdminDashboardProps = {
  searchParams: {
    page?: string;
    limit?: string;
    departments?: string;
    roles?: string;
    searchTerm?: string;
  };
};

export default async function SuperAdminDashboard({
  searchParams,
}: SuperAdminDashboardProps) {
  const pagination = {
    paginate: true,
    page: Number(searchParams.page ?? 1) - 1,
    size: Number(searchParams.limit ?? 10),
  };
  const userToken = cookies().get(process.env.JWT_COOKIE_NAME)!.value;

  async function serverAction(formData: FormData) {
    'use server';

    if (formData.has('clear-all-filters') || formData.has('clearAllFilters')) {
      redirect(`${process.env.SUB_PATH}/super-admin-dashboard`);
    } else {
      const searchParams = new URLSearchParams({
        roles: formData.getAll('roles').join(',') ?? '',
        departments: formData.getAll('departments').join(',') ?? '',
        searchTerm: (formData.get('searchTerm') as string) ?? '',
      });

      redirect(
        `${
          process.env.SUB_PATH
        }/super-admin-dashboard?${searchParams.toString()}`
      );
    }
  }

  const filterData = {
    departments: searchParams.departments ?? '',
    roles: searchParams.roles ?? '',
    searchTerm: searchParams.searchTerm ?? '',
  };

  const data = await getSuperAdminDashboard({
    pagination,
    filterData,
    userToken,
  });

  return (
    <>
      <Navigation />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <form action={serverAction}>
          {/* Ensures hitting "Enter" submits the form. Otherwise defaults to clear all filters when pressing enter */}
          <input type="submit" hidden value="submit" />

          <input
            hidden
            value={headers().get('x-csrf-token') || ''}
            name="_csrf"
          />

          <div className={`${styles.sidebar} govuk-grid-column-one-third`}>
            <h2 className="govuk-heading-l">Manage users</h2>
            {/* counter */}
            <p className="govuk-body">
              We’ve found <strong>{data.userCount}</strong> users
            </p>

            {/* filter button */}
            <div className={styles['top-controls']}>
              <Button addNameAttribute text="Clear all filters" isSecondary />
            </div>

            <Checkboxes
              useOptionValueAsInputValue
              questionTitle="Role"
              fieldName="roles"
              defaultCheckboxes={searchParams.roles?.split(',')}
              titleSize="m"
              options={data.roles.map((role) => ({
                label: role.label,
                value: String(role.id),
              }))}
              small
              fieldErrors={[]}
            />

            <Checkboxes
              useOptionValueAsInputValue
              defaultCheckboxes={searchParams.departments?.split(',')}
              questionTitle="Department"
              fieldName="departments"
              titleSize="m"
              options={data.departments.map((department) => ({
                label: department.name,
                value: String(department.id),
              }))}
              small
              fieldErrors={[]}
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
                defaultValue={searchParams.searchTerm || ''}
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
              rows={convertUserDataToTableRows(data.users)}
            />

            <Pagination
              route={'/super-admin-dashboard'}
              searchParams={searchParams}
              additionalQueryData={{
                clearAllFilters: '',
              }}
              itemsPerPage={10}
              totalItems={data.userCount}
            />
          </div>
        </form>
      </div>
    </>
  );
}

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
