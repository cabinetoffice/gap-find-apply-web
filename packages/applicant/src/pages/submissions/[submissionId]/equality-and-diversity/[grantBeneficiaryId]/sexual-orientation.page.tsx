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
import { postGrantBeneficiaryResponse } from '../../../../../services/GrantBeneficiaryService';
import { GrantBeneficiary } from '../../../../../types/models/GrantBeneficiary';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from '../equality-and-diversity-service-errors';
import { EqualityAndDiversityParams } from '../types';
import { fetchGrantBeneficiary } from './fetchGrantBeneficiary';

export type SexualOrientationPageProps = {
  formAction: string;
  skipURL: string;
  backButtonURL: string;
  defaultChecked?: SexualOrientationCheckboxes[];
  defaultSexualOrientationDetails?: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

type RequestBody = {
  supportedSexualOrientation?:
    | SexualOrientationCheckboxes
    | SexualOrientationCheckboxes[];
  sexualOrientationOtherDetails: string;
};

export enum SexualOrientationCheckboxes {
  STRAIGHT = 'Heterosexual or straight',
  GAY = 'Gay or lesbian',
  BISEXUAL = 'Bisexual',
  OTHER = 'Other',
  ALL = 'No, we support people of any sexual orientation',
}

export const getServerSideProps: GetServerSideProps<
  SexualOrientationPageProps,
  EqualityAndDiversityParams
> = async ({ params, query, resolvedUrl, req, res }) => {
  const { submissionId, grantBeneficiaryId } = params;
  const { returnToSummaryPage } = query;

  let defaultChecked: SexualOrientationPageProps['defaultChecked'];
  let defaultSexualOrientationDetails =
    null as SexualOrientationPageProps['defaultSexualOrientationDetails'];
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
      const formData = {
        submissionId: submissionId,
        hasProvidedAdditionalAnswers: false,
        sexualOrientationGroup1: false,
        sexualOrientationGroup2: false,
        sexualOrientationGroup3: false,
        sexualOrientationOther: false,
        sexualOrientationOtherDetails: '',
        sexualOrientationGroupAll: false,
      };
      if (body.supportedSexualOrientation) {
        const userHasCheckedAllOrientations =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.ALL
          ) ||
          (Array.isArray(body.supportedSexualOrientation) &&
            Object.values(SexualOrientationCheckboxes).every(
              (option) =>
                option === SexualOrientationCheckboxes.ALL ||
                (
                  body.supportedSexualOrientation as SexualOrientationCheckboxes[]
                ).some((orientation) => orientation === option)
            ));

        formData.hasProvidedAdditionalAnswers = true;
        formData.sexualOrientationGroup1 =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.STRAIGHT
          ) && !userHasCheckedAllOrientations;
        formData.sexualOrientationGroup2 =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.GAY
          ) && !userHasCheckedAllOrientations;
        formData.sexualOrientationGroup3 =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.BISEXUAL
          ) && !userHasCheckedAllOrientations;
        formData.sexualOrientationOther =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.OTHER
          ) && !userHasCheckedAllOrientations;
        formData.sexualOrientationOtherDetails =
          body.supportedSexualOrientation.includes(
            SexualOrientationCheckboxes.OTHER
          )
            ? body.sexualOrientationOtherDetails
            : '';
        formData.sexualOrientationGroupAll = userHasCheckedAllOrientations;
      }
      await postGrantBeneficiaryResponse(
        formData,
        getJwtFromCookies(req),
        grantBeneficiaryId
      );
    },
    `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`,
    errorPageParams(submissionId)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    body = response.body;
  }

  if (body) {
    if (typeof body.supportedSexualOrientation === 'string') {
      defaultChecked = [body.supportedSexualOrientation];
    } else {
      defaultChecked = body.supportedSexualOrientation;
    }
    defaultSexualOrientationDetails = body.sexualOrientationOtherDetails;
  } else {
    defaultChecked = [];
    if (grantBeneficiary.sexualOrientationGroupAll) {
      defaultChecked = [SexualOrientationCheckboxes.ALL];
    } else {
      if (grantBeneficiary.sexualOrientationGroup1) {
        defaultChecked.push(SexualOrientationCheckboxes.STRAIGHT);
      }
      if (grantBeneficiary.sexualOrientationGroup2) {
        defaultChecked.push(SexualOrientationCheckboxes.GAY);
      }
      if (grantBeneficiary.sexualOrientationGroup3) {
        defaultChecked.push(SexualOrientationCheckboxes.BISEXUAL);
      }
      if (grantBeneficiary.sexualOrientationOther) {
        defaultChecked.push(SexualOrientationCheckboxes.OTHER);
        defaultSexualOrientationDetails =
          grantBeneficiary.sexualOrientationOtherDetails;
      }
    }
  }

  const { publicRuntimeConfig } = getConfig();

  return {
    props: {
      formAction: `${publicRuntimeConfig.subPath}${resolvedUrl}`,
      backButtonURL: `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'disability'
      }`,
      skipURL: `${publicRuntimeConfig.subPath}/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`,
      defaultChecked: defaultChecked,
      defaultSexualOrientationDetails: defaultSexualOrientationDetails,
      fieldErrors: fieldErrors,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const SexualOrientationPage = ({
  formAction,
  skipURL,
  backButtonURL,
  defaultChecked,
  defaultSexualOrientationDetails,
  fieldErrors,
  csrfToken,
}: SexualOrientationPageProps) => {
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
            questionTitle="Does you organisation primarily focus on supporting a particular sexual orientation?"
            fieldName="supportedSexualOrientation"
            fieldErrors={fieldErrors}
            options={Object.values(SexualOrientationCheckboxes).map(
              (checkbox) => {
                if (checkbox === SexualOrientationCheckboxes.OTHER) {
                  return {
                    label: SexualOrientationCheckboxes.OTHER,
                    conditionalInput: (
                      <TextInput
                        questionTitle="Let us know which sexual orientation"
                        boldHeading={false}
                        titleSize="s"
                        fieldName="sexualOrientationOtherDetails"
                        fieldErrors={fieldErrors}
                        defaultValue={defaultSexualOrientationDetails}
                      />
                    ),
                  };
                }
                return { label: checkbox };
              }
            )}
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

export default SexualOrientationPage;
