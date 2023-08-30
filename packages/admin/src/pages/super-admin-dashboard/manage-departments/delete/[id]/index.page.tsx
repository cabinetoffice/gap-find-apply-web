import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import InferProps from '../../../../../types/InferProps';

export function getServerSideProps(context: GetServerSidePropsContext) {
  return { props: { departmentId: context.params?.id as string } };
}

const DeleteDepartmentPage = ({
  departmentId,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Delete Department" />
      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/manage-departments/edit/${departmentId}`}
      />
      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Delete department</h1>
        <p className="govuk-body">
          If you delete this department, all of its information will be lost.
          You cannot undo this action.
        </p>
        <div className="govuk-button-group">
          <CustomLink
            href={`/api/deleteDepartment?id=${departmentId}`}
            isButton
            customStyle="govuk-button--warning"
          >
            Delete department
          </CustomLink>
          <CustomLink
            href={`/super-admin-dashboard/manage-departments/edit/${departmentId}`}
          >
            Cancel
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default DeleteDepartmentPage;
