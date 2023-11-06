import { GetServerSideProps } from 'next';
import { GrantScheme } from '../../../models/GrantScheme';
import {
  Application,
  getApplicationById,
} from '../../../services/ApplicationService';
import { GrantMandatoryQuestionService } from '../../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../../services/GrantSchemeService';
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
  let application: Application;
  let scheme: GrantScheme;

  try {
    const jwt = getJwtFromCookies(req);

    application = await getApplicationById(applicationId, jwt);

    const schemeService = GrantSchemeService.getInstance();

    scheme = await schemeService.getGrantSchemeById(
      application.grantScheme.id.toString(),
      jwt
    );
    if (scheme.version === 1) {
      const result = await createSubmission(applicationId, jwt);
      const grantSubmissionId = result.submissionId;

      return {
        redirect: {
          destination: routes.submissions.sections(grantSubmissionId),
          permanent: false,
        },
      };
    }

    const mandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();

    const mandatoryQuestionNotExistRedirect =
      await checkIfMandatoryQuestionExist(
        mandatoryQuestionService,
        scheme,
        jwt
      );
    if (mandatoryQuestionNotExistRedirect) {
      //if it not exist, redirect to start page
      return mandatoryQuestionNotExistRedirect;
    }

    const mandatoryQuestionCompleteRedirect =
      await checkIfMandatoryQuestionIsCompleted(
        mandatoryQuestionService,
        scheme,
        jwt
      );

    if (mandatoryQuestionCompleteRedirect) {
      //if is completed, redirect to submission page
      return mandatoryQuestionCompleteRedirect;
    }

    //if it exist and not completed, redirect to start page
    return {
      redirect: {
        destination: routes.mandatoryQuestions.startPage(scheme.id.toString()),
        permanent: false,
      },
    };
  } catch (error) {
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

const checkIfMandatoryQuestionExist = async (
  mandatoryQuestionService: GrantMandatoryQuestionService,
  scheme,
  jwt
) => {
  const mandatoryQuestionExists =
    await mandatoryQuestionService.existBySchemeIdAndApplicantId(
      scheme.id.toString(),
      jwt
    );

  if (!mandatoryQuestionExists) {
    return {
      redirect: {
        destination: routes.mandatoryQuestions.startPage(scheme.id.toString()),
        permanent: false,
      },
    };
  }
};

const checkIfMandatoryQuestionIsCompleted = async (
  mandatoryQuestionService,
  scheme,
  jwt
) => {
  const mandatoryQuestions =
    await mandatoryQuestionService.getMandatoryQuestionBySchemeId(
      jwt,
      scheme.id.toString()
    );

  if (
    mandatoryQuestions.submissionId !== null &&
    mandatoryQuestions.submissionId !== undefined
  ) {
    return {
      redirect: {
        destination: routes.submissions.sections(
          mandatoryQuestions.submissionId
        ),
        permanent: false,
      },
    };
  }
};

const ApplicationCreate = () => {
  return <>Loading...</>;
};

export default ApplicationCreate;
