import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import InferProps from '../../../../types/InferProps';

export async function getServerSideProps() {
  return {
    props: {
      fieldErrors: [],
      user: { gapUserId: 1 },
    },
  };
}

const ChangeOwnerPage = ({
  fieldErrors,
  user,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Manage User - Change Department`}
      />

      <CustomLink
        isBackButton
        href={`/super-admin-dashboard/user/${user.gapUserId}`}
      />

      <h1 className="govuk-heading-l">TODO change owner page</h1>
    </>
  );
};

export default ChangeOwnerPage;
