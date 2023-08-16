import {
  Button,
  QuestionPageGetServerSideProps,
  SummaryList,
} from 'gap-web-ui';
import { getAllDepartments } from '../../../services/SuperAdminService';
import { getUserTokenFromCookies } from '../../../utils/session';
import InferProps from '../../../types/InferProps';
import getConfig from 'next/config';
import Meta from '../../../components/layout/Meta';
import CustomLink from '../../../components/custom-link/CustomLink';
import { GetServerSidePropsContext } from 'next';
import { Department } from '../types';
import { Row } from 'gap-web-ui/dist/cjs/components/summary-list/SummaryList';
import styles from './manage-departments.module.scss';
import { fetchDataOrGetRedirect } from '../../../utils/fetchData';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const getDepartmentsAndUserId = async (jwt: string) => ({
    departments: await getAllDepartments(jwt),
    userId: context.query?.userId || '',
  });

  const getPageData = () =>
    getDepartmentsAndUserId(getUserTokenFromCookies(context.req));

  const props = await fetchDataOrGetRedirect(getPageData);

  if ('redirect' in props) {
    return props;
  }

  return {
    props,
  };
}

const ManageDepartmentsPage = ({
  departments,
  userId,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Manage Departments" />
      <CustomLink
        isBackButton
        href={
          userId
            ? `/super-admin-dashboard/user/${userId}/change-department`
            : '/super-admin-dashboard/'
        }
      />
      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Manage departments</h1>
        <SummaryList
          boldHeaderRow
          hasWiderKeyColumn
          rows={departments.map((dept, idx) => getDepartmentRow(idx, dept))}
        />
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

const getDepartmentRow = (
  index: number,
  { id, name, ggisID = '' }: Department
): Row =>
  index === 0
    ? {
        key: 'Department',
        value: 'GGIS ID',
        action: <span className={styles['float-left-sm']}>Actions</span>,
      }
    : {
        key: name,
        value: ggisID,
        action: (
          <div className={styles['float-left-sm']}>
            <CustomLink
              href={`/super-admin-dashboard/manage-departments/edit/${id}`}
            >
              Edit
            </CustomLink>
          </div>
        ),
      };

export default ManageDepartmentsPage;
