import {
  Checkboxes,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../../models/GrantBeneficiary';
import {
  postGrantBeneficiaryResponse,
} from '../../../../../services/GrantBeneficiaryService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from '../equality-and-diversity-service-errors';
import { fetchGrantBeneficiary } from './fetchGrantBeneficiary';

type RequestBody = {
  supportedEthnicity?: EthnicityCheckboxes | EthnicityCheckboxes[];
  ethnicOtherDetails: string;
};

export enum EthnicityCheckboxes {
  WHITE = 'White',
  MIXED = 'Mixed or multiple ethnic groups',
  ASIAN = 'Asian or Asian British',
  BLACK = 'Black, African, Caribbean or Black British',
  ARAB = 'Arab',
  OTHER = 'Other ethnic group',
  ALL = 'No, we support all ethnic groups',
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

  let defaultChecked: EthnicityPageProps['defaultChecked'];
  let defaultEthnicityDetails =
    null as EthnicityPageProps['defaultEthnicityDetails'];
  let fieldErrors = [] as ValidationError[];
  let body: RequestBody;

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await fetchGrantBeneficiary(submissionId, req);
  } catch (_) {
    return errorPageRedirect(submissionId);
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.supportedEthnicity) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            ethnicGroup1:
              body.supportedEthnicity.includes(EthnicityCheckboxes.WHITE) ||
              body.supportedEthnicity.includes(EthnicityCheckboxes.ALL),
            ethnicGroup2:
              body.supportedEthnicity.includes(EthnicityCheckboxes.MIXED) ||
              body.supportedEthnicity.includes(EthnicityCheckboxes.ALL),
            ethnicGroup3:
              body.supportedEthnicity.includes(EthnicityCheckboxes.ASIAN) ||
              body.supportedEthnicity.includes(EthnicityCheckboxes.ALL),
            ethnicGroup4:
              body.supportedEthnicity.includes(EthnicityCheckboxes.BLACK) ||
              body.supportedEthnicity.includes(EthnicityCheckboxes.ALL),
            ethnicGroup5:
              body.supportedEthnicity.includes(EthnicityCheckboxes.ARAB) ||
              body.supportedEthnicity.includes(EthnicityCheckboxes.ALL),
            ethnicGroupOther: body.supportedEthnicity.includes(
              EthnicityCheckboxes.OTHER
            ),
            ethnicOtherDetails: body.supportedEthnicity.includes(
              EthnicityCheckboxes.OTHER
            )
              ? body.ethnicOtherDetails
              : '',
            ethnicGroupAll: body.supportedEthnicity.includes(
              EthnicityCheckboxes.ALL
            ),
          },
          getJwtFromCookies(req),
          grantBeneficiaryId
        );
      }
    },
    returnToSummaryPage
      ? `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`
      : `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/disability`,
    errorPageParams(submissionId)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    body = response.body;
  }

  if (body) {
    if (typeof body.supportedEthnicity === 'string') {
      defaultChecked = [body.supportedEthnicity];
    } else {
      defaultChecked = body.supportedEthnicity;
    }
    defaultEthnicityDetails = body.ethnicOtherDetails;
  } else {
    defaultChecked = [];
    if (grantBeneficiary.ethnicGroupAll) {
      defaultChecked = [EthnicityCheckboxes.ALL];
    } else {
      if (grantBeneficiary.ethnicGroup1) {
        defaultChecked.push(EthnicityCheckboxes.WHITE);
      }
      if (grantBeneficiary.ethnicGroup2) {
        defaultChecked.push(EthnicityCheckboxes.MIXED);
      }
      if (grantBeneficiary.ethnicGroup3) {
        defaultChecked.push(EthnicityCheckboxes.ASIAN);
      }
      if (grantBeneficiary.ethnicGroup4) {
        defaultChecked.push(EthnicityCheckboxes.BLACK);
      }
      if (grantBeneficiary.ethnicGroup5) {
        defaultChecked.push(EthnicityCheckboxes.ARAB);
      }
      if (grantBeneficiary.ethnicGroupOther) {
        defaultChecked.push(EthnicityCheckboxes.OTHER);
        defaultEthnicityDetails = grantBeneficiary.ethnicOtherDetails;
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
        returnToSummaryPage ? 'summary' : 'disability'
      }`,
      backButtonURL: `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'age'
      }`,
      defaultChecked: defaultChecked,
      defaultEthnicityDetails: defaultEthnicityDetails,
      fieldErrors: fieldErrors,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const EthnicityPage = ({
  formAction,
  skipURL,
  backButtonURL,
  defaultChecked,
  defaultEthnicityDetails,
  fieldErrors,
  csrfToken,
}: EthnicityPageProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Equality and diversity - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonURL}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Checkboxes
            questionTitle="Does your organisation primarily focus on supporting a particular ethnic group?"
            fieldName="supportedEthnicity"
            fieldErrors={fieldErrors}
            options={Object.values(EthnicityCheckboxes).map((checkbox) => {
              if (checkbox === EthnicityCheckboxes.OTHER) {
                return {
                  label: EthnicityCheckboxes.OTHER,
                  conditionalInput: (
                    <TextInput
                      questionTitle="Type the ethnic group here"
                      boldHeading={false}
                      titleSize="s"
                      fieldName="ethnicOtherDetails"
                      fieldErrors={fieldErrors}
                      defaultValue={defaultEthnicityDetails}
                    />
                  ),
                };
              }
              return { label: checkbox };
            })}
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

export type EthnicityPageProps = {
  formAction: string;
  skipURL: string;
  backButtonURL: string;
  defaultChecked?: EthnicityCheckboxes[];
  defaultEthnicityDetails?: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

export default EthnicityPage;
