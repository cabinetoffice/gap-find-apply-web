import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import { getApplicationById } from '../../../services/ApplicationService';
import { GrantMandatoryQuestionService } from '../../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../../services/GrantSchemeService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { GrantApplication } from '../../../types/models/GrantApplication';
import { logger } from '../../../utils/logger';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
  query,
}) => {
  const applicationId = params.applicationId.toString();
  const { publicRuntimeConfig } = getConfig();

  try {
    const jwt = getJwtFromCookies(req);
    const application: GrantApplication = await getApplicationById(
      applicationId,
      jwt
    );

    const schemeService = GrantSchemeService.getInstance();
    const { grantScheme: scheme } = await schemeService.getGrantSchemeById(
      application.grantScheme.id.toString(),
      jwt
    );

    // For version > 1, we need to get the mandatory question ID
    let mandatoryQuestionId = null;
    if (scheme.version > 1) {
      const mandatoryQuestionService =
        GrantMandatoryQuestionService.getInstance();
      const mandatoryQuestionExists =
        await mandatoryQuestionService.existBySchemeIdAndApplicantId(
          scheme.id.toString(),
          jwt
        );
      if (mandatoryQuestionExists) {
        const mandatoryQuestion =
          await mandatoryQuestionService.getMandatoryQuestionBySchemeId(
            jwt,
            scheme.id.toString()
          );
        mandatoryQuestionId = mandatoryQuestion.id;
      }
    }

    // Handle validation errors from query parameters
    let fieldErrors: ValidationError[] = [];
    let defaultValue = '';
    
    if (query.error === 'invalidCharacters') {
      fieldErrors = [
        {
          fieldName: 'submissionName',
          errorMessage: 'Application name must only include letters and numbers',
        },
      ];
      // Preserve the submitted value if it was provided
      if (query.submissionName && typeof query.submissionName === 'string') {
        defaultValue = query.submissionName;
      }
    }

    return {
      props: {
        applicationId,
        applicationName: application.applicationName,
        schemeVersion: scheme.version,
        mandatoryQuestionId,
        schemeId: scheme.id.toString(),
        subPath: publicRuntimeConfig.subPath,
        fieldErrors,
        defaultValue,
      },
    };
  } catch (error) {
    logger.error(logger.utils.addErrorInfo(error, req));
    return {
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while loading the page","linkAttributes":{"href":"/applications","linkText":"Please return","linkInformation":" to your applications and try again."}}`,
        permanent: false,
      },
    };
  }
};

interface NameSubmissionPageProps {
  applicationId: string;
  applicationName: string;
  schemeVersion: number;
  mandatoryQuestionId?: string;
  schemeId: string;
  subPath: string;
  fieldErrors: ValidationError[];
  defaultValue: string;
}

export default function NameSubmissionPage({
  applicationId,
  applicationName,
  schemeVersion,
  mandatoryQuestionId,
  schemeId,
  subPath,
  fieldErrors,
  defaultValue,
}: NameSubmissionPageProps) {
  // For version > 1, use the create-submission API that links to mandatory questions
  // For version 1, use the simple create-submission-with-name API
  const formAction =
    schemeVersion > 1 && mandatoryQuestionId
      ? `${subPath}/api/create-submission?mandatoryQuestionId=${mandatoryQuestionId}&schemeId=${schemeId}`
      : `${subPath}/api/applications/${applicationId}/create-submission-with-name`;

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Name this application - Apply for a grant`}
      />
      <Layout backBtnUrl={routes.applications}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken=""
        >
          <TextInput
            questionTitle="Name this application"
            questionHintText={
              <>
                You have already applied for this grant. Give this application a different name so you can tell it apart from your other applications.
                <br />
                <br />
                Your application name must only use letters and numbers. For example, 'Application 2' or 'Smith Family'.
              </>
            }
            fieldName="submissionName"
            defaultValue={defaultValue}
            fieldErrors={fieldErrors}
            width="30"
            limit={255}
          />

          <Button text="Continue" type={ButtonTypePropertyEnum.Submit} />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
