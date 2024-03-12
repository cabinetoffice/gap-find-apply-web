import { SummaryList } from 'gap-web-ui';
import { Row } from 'gap-web-ui/dist/cjs/components/summary-list/SummaryList';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { getAllDepartments } from '../../../services/SuperAdminService';
import InferProps from '../../../types/InferProps';
import { fetchDataOrGetRedirect } from '../../../utils/fetchDataOrGetRedirect';
import { getUserTokenFromCookies } from '../../../utils/session';
import { Department } from '../types';
import styles from './manage-departments.module.scss';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const getDepartmentsAndUserId = async (jwt: string) => ({
    departments: await getAllDepartments(jwt),
    userId: context.query?.userId || '',
    newUserRoles: context.query?.newRoles || '',
  });

  const getPageData = () =>
    getDepartmentsAndUserId(getUserTokenFromCookies(context.req));

  return await fetchDataOrGetRedirect(getPageData);
}

const ManageDepartmentsPage = ({
  departments,
  userId,
  newUserRoles,
}: InferProps<typeof getServerSideProps>) => {
  const rows = departments.map((dept) => getDepartmentRow(dept));
  rows.splice(0, 0, getManageDepartmentsHeadingRow());

  return (
    <>
      <Meta title="Manage Departments" />
      <CustomLink
        isBackButton
        href={
          userId
            ? newUserRoles.length > 0
              ? `/super-admin-dashboard/user/${userId}/change-department?newRoles=${newUserRoles}`
              : `/super-admin-dashboard/user/${userId}/change-department`
            : '/super-admin-dashboard/'
        }
      />
      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Manage departments</h1>
        <SummaryList boldHeaderRow hasWiderKeyColumn rows={rows} />
        <CustomLink
          href={`/super-admin-dashboard/manage-departments/add`}
          isButton
          isSecondaryButton
        >
          Add new department
        </CustomLink>
      </div>
    </>
  );
};

const getManageDepartmentsHeadingRow = (): Row => ({
  key: 'Department',
  value: 'GGIS ID',
  action: <span className={styles['float-left-sm']}>Actions</span>,
});

const getDepartmentRow = ({ id, name, ggisID = '' }: Department): Row => ({
  key: name,
  value: ggisID,
  action: (
    <div className={styles['text-align-left']}>
      <CustomLink href={`/super-admin-dashboard/manage-departments/edit/${id}`}>
        Edit
      </CustomLink>
    </div>
  ),
});

export default ManageDepartmentsPage;
