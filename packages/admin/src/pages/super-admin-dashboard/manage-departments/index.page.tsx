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

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const fetchPageData = async (jwt: string) => ({
    departments: await getAllDepartments(jwt),
    userId: context.query?.userId || '',
  });

  const res = await QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    jwt: getUserTokenFromCookies(context.req),
    onErrorMessage: 'Failed to load departments, please try again later.',
  });

  return res;
}

const ManageDepartmentsPage = ({
  pageData: { departments, userId },
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${fieldErrors.length > 0 ? 'Error: ' : ''}Manage Departments`}
      />
      <CustomLink
        isBackButton
        href={
          userId
            ? `/super-admin-dashboard/user/${userId}/change-department`
            : '/super-admin-dashboard/'
        }
      />
      <main className="govuk-main-wrapper govuk-main-wrapper--auto-spacing">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l">Manage a user</h1>
            <h2 className="govuk-heading-m">User Information</h2>
            <SummaryList
              summaryListClassName="key-width-40percent-sm"
              rows={departments.map((dept, idx) => getDepartmentRow(idx, dept))}
            />
            <CustomLink
              href={`/manage-departments/create`}
              isButton
              isSecondaryButton
            >
              Add new department
            </CustomLink>
          </div>
        </div>
      </main>
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
        action: <span className="float-left-sm">Actions</span>,
      }
    : {
        key: name,
        value: ggisID,
        action: (
          <div className="float-left-sm">
            <CustomLink
              href={`/super-admin-dashboard/manage-departments/edit/${id}`}
            >
              Edit
            </CustomLink>
          </div>
        ),
      };

export default ManageDepartmentsPage;
