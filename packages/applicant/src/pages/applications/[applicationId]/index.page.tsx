import { GetServerSideProps } from 'next';
import { createSubmission } from '../../../services/SubmissionService';
import { validateCSRF } from '../../../utils/csrf';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';

//TODO: we could make this an API endpoint since it doesn't actually render anything
export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  await validateCSRF(req, res);

  const applicationId = params.applicationId.toString();
  try {
    const result = await createSubmission(
      applicationId,
      getJwtFromCookies(req)
    );

    const grantSubmissionId = result.submissionId;

    return {
      redirect: {
        destination: routes.submissions.sections(grantSubmissionId),
        permanent: false,
      },
    };
  } catch (error) {
    console.error(error);
    if (error?.response?.data?.code === 'GRANT_NOT_PUBLISHED') {
      return {
        redirect: {
          destination: `/grant-is-closed`,
          permanent: false,
        },
      };
    } else {
      return {
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create your application","linkAttributes":{"href":"/applications/${applicationId}/","linkText":"Please return","linkInformation":" and try again."}}`,
          permanent: false,
        },
      };
    }
  }
};

const ApplicationCreate = () => {
  return <>Loading...</>;
};

export default ApplicationCreate;
