import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
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

    return {
      props: {
        applicationId,
        applicationName: application.applicationName,
        schemeVersion: scheme.version,
        mandatoryQuestionId,
        schemeId: scheme.id.toString(),
        subPath: publicRuntimeConfig.subPath,
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
}

export default function NameSubmissionPage({
  applicationId,
  applicationName,
  schemeVersion,
  mandatoryQuestionId,
  schemeId,
  subPath,
}: NameSubmissionPageProps) {
  // For version > 1, use the create-submission API that links to mandatory questions
  // For version 1, use the simple create-submission-with-name API
  const formAction =
    schemeVersion > 1 && mandatoryQuestionId
      ? `${subPath}/api/create-submission?mandatoryQuestionId=${mandatoryQuestionId}&schemeId=${schemeId}`
      : `${subPath}/api/applications/${applicationId}/create-submission-with-name`;

  return (
    <>
      <Meta title="Name this application - Apply for a grant" />
      <Layout backBtnUrl={routes.applications}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={[]}
          csrfToken=""
        >
          <TextInput
            questionTitle="Name this application"
            questionHintText={`You have more than one application for this scheme. You can give this one a name to help you tell them apart. For example, 'Project Mr Smith'`}
            fieldName="submissionName"
            defaultValue=""
            fieldErrors={[]}
            width="30"
            limit={255}
          />

          <Button text="Continue" type={ButtonTypePropertyEnum.Submit} />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
