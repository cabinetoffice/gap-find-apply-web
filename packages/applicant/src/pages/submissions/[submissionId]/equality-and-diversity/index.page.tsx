import {
  Details,
  FlexibleQuestionPageLayout,
  Radio,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../components/partials/Layout';
import Meta from '../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../models/GrantBeneficiary';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../services/GrantBeneficiaryService';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from './equality-and-diversity-service-errors';

type RequestBody = {
  hasProvidedAdditionalAnswers: 'Yes' | 'No';
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const { submissionId } = params as Record<string, string>;
  let { grantBeneficiaryId } = params as Record<string, string>;
  let defaultChecked: SubmissionConfirmationProps['defaultChecked'] = null;
  let fieldErrors: ValidationError[] = [];

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await getGrantBeneficiary(
      submissionId,
      getJwtFromCookies(req)
    );
    grantBeneficiaryId = grantBeneficiary.grantBeneficiaryId;
  } catch (err) {
    return errorPageRedirect(submissionId);
  }
  if (grantBeneficiary.hasProvidedAdditionalAnswers === false) {
    defaultChecked = 'No, skip the equality questions';
  } else if (grantBeneficiary.hasProvidedAdditionalAnswers === true) {
    defaultChecked = 'Yes, answer the equality questions (takes 2 minutes)';
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      const hasProvidedAdditionalAnswers = body.hasProvidedAdditionalAnswers
        ? body.hasProvidedAdditionalAnswers === 'Yes'
        : null;

      await postGrantBeneficiaryResponse(
        {
          submissionId: submissionId,
          hasProvidedAdditionalAnswers: hasProvidedAdditionalAnswers,
        },
        getJwtFromCookies(req),
        grantBeneficiaryId
      );

      return hasProvidedAdditionalAnswers;
    },
    (hasProvidedAdditionalAnswers) => {
      if (hasProvidedAdditionalAnswers) {
        return `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/organisation`;
      }
      return `/submissions/${submissionId}/submission-confirmation`;
    },
    errorPageParams(submissionId)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
  }

  const { publicRuntimeConfig } = getConfig();

  return {
    props: {
      formAction: `${publicRuntimeConfig.subPath}${resolvedUrl}`,
      defaultChecked: defaultChecked,
      csrfToken: (req as any).csrfToken?.() || '',
      fieldErrors,
    },
  };
};

const EqualityAndDiversityPage = ({
  formAction,
  defaultChecked,
  csrfToken,
  fieldErrors,
}: SubmissionConfirmationProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Equality and diversity - Apply for a grant`}
      />

      <Layout>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <h1
            className="govuk-heading-l"
            data-cy="cy-equality-and-diversity-header"
          >
            We have received your application
          </h1>

          <p
            className="govuk-body"
            data-cy="cy-equality-and-diversity-paragraph"
          >
            Before you finish using the service, we’d like to ask some equality
            questions.
          </p>

          <Radio
            questionTitle="Do you want to answer the equality questions?"
            titleSize="m"
            questionHintText={
              <>
                <p data-cy="cy-equality-and-diversity-hint-paragraph-1">
                  These questions are optional. We would like to understand who
                  the grant will benefit.
                </p>
                <p data-cy="cy-equality-and-diversity-hint-paragraph-2">
                  Your answers will not affect your application.
                </p>
              </>
            }
            fieldName="hasProvidedAdditionalAnswers"
            fieldErrors={fieldErrors}
            radioOptions={[
              {
                label: 'Yes, answer the equality questions (takes 2 minutes)',
                value: 'Yes',
              },
              { label: 'No, skip the equality questions', value: 'No' },
            ]}
            defaultChecked={defaultChecked}
            TitleTag="h2"
          />

          <Details
            title="Why we ask equality questions"
            text="Public sector organisations have a duty to avoid discrimination and advance equality of opportunity. We use these questions to measure this."
          />

          <button
            className="govuk-button"
            data-module="govuk-button"
            data-cy="cy-continue-button"
          >
            Continue
          </button>
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
};

export type SubmissionConfirmationProps = {
  formAction: string;
  defaultChecked?:
    | 'No, skip the equality questions'
    | 'Yes, answer the equality questions (takes 2 minutes)';
  csrfToken: string;
  fieldErrors: ValidationError[];
};

export default EqualityAndDiversityPage;
