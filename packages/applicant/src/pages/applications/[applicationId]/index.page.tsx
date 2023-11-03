import { GetServerSideProps } from 'next';
import { GrantScheme } from '../../../models/GrantScheme';
import {
  Application,
  getApplicationById,
} from '../../../services/ApplicationService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
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
  const jwt = getJwtFromCookies(req);
  const applicationId = params.applicationId.toString();

  // TODO handle MQ: hit an endpoint with applicationId to get the version & MQ status
  //  (or just whether we need to show MQ and let the BE handle logic)
  let application: Application;
  let scheme: GrantScheme;
  let mandatoryQuestions: GrantMandatoryQuestionDto;
  try {
    const jwt = getJwtFromCookies(req);

    application = await getApplicationById(applicationId, jwt);
    console.log('application', application);
    const schemeService = GrantSchemeService.getInstance();
    scheme = await schemeService.getGrantSchemeById(
      application.grantScheme.id.toString(),
      jwt
    );
    console.log('scheme', scheme);
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
    mandatoryQuestions =
      await mandatoryQuestionService.getMandatoryQuestionBySchemeId(
        jwt,
        scheme.id.toString()
      );
    console.log('mandatoryQuestion', mandatoryQuestions);
    if (
      mandatoryQuestions.submissionId !== null ||
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
    } else {
      return {
        redirect: {
          destination: routes.mandatoryQuestions.startPage(
            scheme.id.toString()
          ),
          permanent: false,
        },
      };
    }
  } catch (error) {
    console.error(error);
    if (error?.response?.data?.code === 'GRANT_NOT_PUBLISHED') {
      return {
        redirect: {
          destination: `/grant-is-closed`,
          permanent: false,
        },
      };
    } else if (
      error?.response?.data?.message.contains('mandatory question with id')
    ) {
      return {
        redirect: {
          destination: routes.mandatoryQuestions.startPage(
            scheme.id.toString()
          ),
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
