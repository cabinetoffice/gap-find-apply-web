import {
  Radio,
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
import { EqualityAndDiversityParams } from '../types';

type RequestBody = {
  ethnicOtherDetails: string;
  supportedEthnicity: EthnicityPageProps['defaultChecked'] | EthnicityRadioOptions.ALL;
}

export enum EthnicityRadioOptions {
  WHITE = 'White',
  MIXED = 'Mixed or multiple ethnic groups',
  ASIAN = 'Asian or Asian British',
  BLACK = 'Black, African, Caribbean or Black British',
  ARAB = 'Arab',
  OTHER = 'Other ethnic group',
  ALL = 'No, we support all ethnic groups',
}

export const getServerSideProps: GetServerSideProps<{}, EqualityAndDiversityParams> = async ({
  params,
  resolvedUrl,
  req,
  res,
  query,
}) => {
  const { submissionId, grantBeneficiaryId } = params;
  const { returnToSummaryPage } = query;

  let defaultChecked = null as EthnicityPageProps['defaultChecked'];
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
              body.supportedEthnicity === EthnicityRadioOptions.WHITE ||
              body.supportedEthnicity === EthnicityRadioOptions.ALL,
            ethnicGroup2:
              body.supportedEthnicity === EthnicityRadioOptions.MIXED ||
              body.supportedEthnicity === EthnicityRadioOptions.ALL,
            ethnicGroup3:
              body.supportedEthnicity === EthnicityRadioOptions.ASIAN ||
              body.supportedEthnicity === EthnicityRadioOptions.ALL,
            ethnicGroup4:
              body.supportedEthnicity === EthnicityRadioOptions.BLACK ||
              body.supportedEthnicity === EthnicityRadioOptions.ALL,
            ethnicGroup5:
              body.supportedEthnicity === EthnicityRadioOptions.ARAB ||
              body.supportedEthnicity === EthnicityRadioOptions.ALL,
            ethnicGroupOther: body.supportedEthnicity === (
              EthnicityRadioOptions.OTHER
            ),
            ethnicOtherDetails: body.supportedEthnicity === (
              EthnicityRadioOptions.OTHER
            )
              ? body.ethnicOtherDetails
              : '',
            ethnicGroupAll: body.supportedEthnicity === (
              EthnicityRadioOptions.ALL
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

  if (fieldErrors.length != 0) {
    body.supportedEthnicity === EthnicityRadioOptions.OTHER 
    ? defaultChecked = EthnicityRadioOptions.OTHER
    : defaultChecked = body.supportedEthnicity;
      defaultEthnicityDetails = body.ethnicOtherDetails;
}
  else {
   if (grantBeneficiary.ethnicGroupAll) {
    defaultChecked = EthnicityRadioOptions.ALL;
  } else if (grantBeneficiary.ethnicGroup1) {
    defaultChecked = EthnicityRadioOptions.WHITE;
  } else if (grantBeneficiary.ethnicGroup2) {
    defaultChecked = EthnicityRadioOptions.MIXED;
  } else if (grantBeneficiary.ethnicGroup3) {
    defaultChecked = EthnicityRadioOptions.ASIAN;
  } else if (grantBeneficiary.ethnicGroup4) {
    defaultChecked = EthnicityRadioOptions.BLACK;
  } else if (grantBeneficiary.ethnicGroup5) {
    defaultChecked = EthnicityRadioOptions.ARAB;
  } else if (grantBeneficiary.ethnicGroupOther) {
    defaultChecked = EthnicityRadioOptions.OTHER;
    defaultEthnicityDetails = grantBeneficiary.ethnicOtherDetails;
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
  defaultEthnicityDetails,
  fieldErrors,
  defaultChecked,
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
          <Radio
            questionTitle="Does your organisation primarily focus on supporting a particular ethnic group?"
            fieldName="supportedEthnicity"
            fieldErrors={fieldErrors}
            radioOptions={Object.values(EthnicityRadioOptions).map((radio) => {
              if (radio === EthnicityRadioOptions.OTHER) {
                return {
                  label: EthnicityRadioOptions.OTHER,
                  value: EthnicityRadioOptions.OTHER,
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
              return { label: radio, value: radio };
            })}
            defaultChecked={defaultChecked}
            divideLastRadioOption={true}
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
  defaultChecked?: EthnicityRadioOptions;
  defaultEthnicityDetails?: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

export default EthnicityPage;
