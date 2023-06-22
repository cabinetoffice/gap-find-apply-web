import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
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
  sex: SexPageProps['defaultChecked'] | 'NoWeSupportBothSexes';
};

export enum SexRadioOptions {
  MALE = 'Male',
  FEMALE = 'Female',
  ALL = 'No, we support both sexes',
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
  let defaultChecked = null as SexPageProps['defaultChecked'];

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await fetchGrantBeneficiary(submissionId, req);
  } catch (_) {
    return errorPageRedirect(submissionId);
  }

  if (grantBeneficiary.sexGroupAll) {
    defaultChecked = SexRadioOptions.ALL;
  } else if (grantBeneficiary.sexGroup1) {
    defaultChecked = SexRadioOptions.MALE;
  } else if (grantBeneficiary.sexGroup2) {
    defaultChecked = SexRadioOptions.FEMALE;
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.sex) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            sexGroup1:
              body.sex === SexRadioOptions.MALE ||
              body.sex === 'NoWeSupportBothSexes',
            sexGroup2:
              body.sex === SexRadioOptions.FEMALE ||
              body.sex === 'NoWeSupportBothSexes',
            sexGroupAll: body.sex === 'NoWeSupportBothSexes',
          },
          getJwtFromCookies(req),
          grantBeneficiaryId
        );
      }
    },
    returnToSummaryPage
      ? `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`
      : `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/age`,
    errorPageParams(submissionId)
  );

  if ('redirect' in response) {
    return response;
  }

  const { publicRuntimeConfig } = getConfig();

  return {
    props: {
      formAction: `${publicRuntimeConfig.subPath}${resolvedUrl}`,
      skipURL: `${
        publicRuntimeConfig.subPath
      }/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'age'
      }`,
      defaultChecked: defaultChecked,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const SexPage = ({
  formAction,
  defaultChecked,
  skipURL,
  csrfToken,
}: SexPageProps) => {
  return (
    <>
      <Meta title="Equality and diversity - Apply for a grant" />

      <Layout>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={[]}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Does your organisation primarily focus on supporting a particular sex?"
            fieldName="sex"
            fieldErrors={[]}
            radioOptions={Object.values(SexRadioOptions).map((option) => ({
              label: option,
            }))}
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

export type SexPageProps = {
  formAction: string;
  skipURL: string;
  defaultChecked?: SexRadioOptions;
  csrfToken: string;
};

export default SexPage;
