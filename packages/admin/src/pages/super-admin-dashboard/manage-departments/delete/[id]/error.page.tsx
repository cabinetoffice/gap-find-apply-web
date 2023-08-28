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
      <Meta title="Error: Delete Department" />

      <div className="govuk-!-padding-top-7">
        <h1 className="govuk-heading-l">Failed to delete department</h1>

        <p className="govuk-body">
          Cannot delete a department with users assigned to it.
        </p>

        <p className="govuk-body">
          <CustomLink
            href={`/super-admin-dashboard?departments=${departmentId}`}
          >
            View and edit users assigned to this department
          </CustomLink>
        </p>
      </div>
    </>
  );
};

export default DeleteDepartmentPage;
