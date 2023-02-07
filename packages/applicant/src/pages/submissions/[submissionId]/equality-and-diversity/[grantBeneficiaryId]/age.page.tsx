import {
  Checkboxes,
  FlexibleQuestionPageLayout,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../../models/GrantBeneficiary';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../../services/GrantBeneficiaryService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from '../equality-and-diversity-service-errors';

type RequestBody = {
  supportedAges?: AgeCheckboxes | AgeCheckboxes[];
};

export enum AgeCheckboxes {
  ZERO_TO_FOURTEEN = '0 to 14 year olds',
  FIFTEEN_TO_TWENTY_FOUR = '15 to 24 year olds',
  TWENTY_FIVE_TO_FIFTY_FOUR = '25 to 54 year olds',
  FIFTY_FIVE_TO_SIXTY_FOUR = '55 to 64 year olds',
  SIXTY_FIVE_PLUS = '65 year olds and over',
  ALL = 'No, we support all age groups',
}

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
  query,
}) => {
  const { submissionId, grantBeneficiaryId } = params as Record<string, string>;
  const { returnToSummaryPage } = query as Record<string, string>;

  let defaultChecked: AgePageProps['defaultChecked'];
  let fieldErrors = [] as ValidationError[];
  let body: RequestBody;

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await getGrantBeneficiary(
      submissionId,
      getJwtFromCookies(req)
    );
  } catch (err) {
    return errorPageRedirect(submissionId);
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.supportedAges) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            ageGroup1:
              body.supportedAges.includes(AgeCheckboxes.ZERO_TO_FOURTEEN) ||
              body.supportedAges.includes(AgeCheckboxes.ALL),
            ageGroup2:
              body.supportedAges.includes(
                AgeCheckboxes.FIFTEEN_TO_TWENTY_FOUR
              ) || body.supportedAges.includes(AgeCheckboxes.ALL),
            ageGroup3:
              body.supportedAges.includes(
                AgeCheckboxes.TWENTY_FIVE_TO_FIFTY_FOUR
              ) || body.supportedAges.includes(AgeCheckboxes.ALL),
            ageGroup4:
              body.supportedAges.includes(
                AgeCheckboxes.FIFTY_FIVE_TO_SIXTY_FOUR
              ) || body.supportedAges.includes(AgeCheckboxes.ALL),
            ageGroup5:
              body.supportedAges.includes(AgeCheckboxes.SIXTY_FIVE_PLUS) ||
              body.supportedAges.includes(AgeCheckboxes.ALL),
            ageGroupAll: body.supportedAges.includes(AgeCheckboxes.ALL),
          },
          getJwtFromCookies(req),
          grantBeneficiaryId
        );
      }
    },
    returnToSummaryPage
      ? `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`
      : `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/ethnicity`,
    errorPageParams(submissionId)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    body = response.body;
  }

  if (body) {
    if (typeof body.supportedAges === 'string') {
      defaultChecked = [body.supportedAges];
    } else {
      defaultChecked = body.supportedAges;
    }
  } else {
    defaultChecked = [];
    if (grantBeneficiary.ageGroupAll) {
      defaultChecked = [AgeCheckboxes.ALL];
    } else {
      if (grantBeneficiary.ageGroup1) {
        defaultChecked.push(AgeCheckboxes.ZERO_TO_FOURTEEN);
      }
      if (grantBeneficiary.ageGroup2) {
        defaultChecked.push(AgeCheckboxes.FIFTEEN_TO_TWENTY_FOUR);
      }
      if (grantBeneficiary.ageGroup3) {
        defaultChecked.push(AgeCheckboxes.TWENTY_FIVE_TO_FIFTY_FOUR);
      }
      if (grantBeneficiary.ageGroup4) {
        defaultChecked.push(AgeCheckboxes.FIFTY_FIVE_TO_SIXTY_FOUR);
      }
      if (grantBeneficiary.ageGroup5) {
        defaultChecked.push(AgeCheckboxes.SIXTY_FIVE_PLUS);
      }
    }
  }

  const { publicRuntimeConfig } = getConfig();

  return {
    props: {
      formAction: `${publicRuntimeConfig.subPath}${resolvedUrl}`,
      skipURL: `${
        publicRuntimeConfig.subPath
      }/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'ethnicity'
      }`,
      backButtonURL: `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'sex'
      }`,
      defaultChecked: defaultChecked,
      fieldErrors: fieldErrors,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const AgePage = ({
  formAction,
  skipURL,
  backButtonURL,
  defaultChecked,
  fieldErrors,
  csrfToken,
}: AgePageProps) => {
  return (
    <>
      <Meta title="Equality and diversity - Apply for a grant" />

      <Layout backBtnUrl={backButtonURL}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Checkboxes
            questionTitle="Does your organisation primarily focus on supporting a particular age group?"
            fieldName="supportedAges"
            fieldErrors={fieldErrors}
            options={Object.values(AgeCheckboxes)}
            defaultCheckboxes={defaultChecked}
            divideLastCheckboxOption={true}
          />

          <div className="govuk-button-group">
            <button className="govuk-button" data-module="govuk-button">
              Continue
            </button>

            <a
              href={skipURL}
              role="button"
              draggable="false"
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
            >
              Skip this question
            </a>
          </div>
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
};

export type AgePageProps = {
  formAction: string;
  skipURL: string;
  backButtonURL: string;
  defaultChecked?: AgeCheckboxes[];
  fieldErrors: ValidationError[];
  csrfToken: string;
};

export default AgePage;
