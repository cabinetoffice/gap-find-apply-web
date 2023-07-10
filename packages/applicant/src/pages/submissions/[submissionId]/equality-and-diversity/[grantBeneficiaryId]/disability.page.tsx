import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../../models/GrantBeneficiary';
import { postGrantBeneficiaryResponse } from '../../../../../services/GrantBeneficiaryService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from '../equality-and-diversity-service-errors';
import { EqualityAndDiversityParams } from '../types';
import { fetchGrantBeneficiary } from './fetchGrantBeneficiary';

export type DisabilityPageProps = {
  formAction: string;
  skipURL: string;
  backButtonURL: string;
  defaultChecked?: 'Yes' | 'No';
  csrfToken: string;
};

type RequestBody = {
  disability: DisabilityPageProps['defaultChecked'];
};

export const getServerSideProps: GetServerSideProps<
  DisabilityPageProps,
  EqualityAndDiversityParams
> = async ({ params, resolvedUrl, req, res, query }) => {
  const { submissionId, grantBeneficiaryId } = params;
  const { returnToSummaryPage } = query;
  let defaultChecked = null as DisabilityPageProps['defaultChecked'];

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await fetchGrantBeneficiary(submissionId, req);
  } catch (_) {
    return errorPageRedirect(submissionId);
  }

  if (grantBeneficiary.supportingDisabilities === true) {
    defaultChecked = 'Yes';
  } else if (grantBeneficiary.supportingDisabilities === false) {
    defaultChecked = 'No';
  }

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.disability) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            supportingDisabilities: body.disability === 'Yes',
          },
          getJwtFromCookies(req),
          grantBeneficiaryId
        );
      }
    },
    returnToSummaryPage
      ? `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`
      : `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/sexual-orientation`,
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
        returnToSummaryPage ? 'summary' : 'sexual-orientation'
      }`,
      backButtonURL: `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/${
        returnToSummaryPage ? 'summary' : 'ethnicity'
      }`,
      defaultChecked: defaultChecked,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const DisabilityPage = ({
  formAction,
  skipURL,
  backButtonURL,
  defaultChecked,
  csrfToken,
}: DisabilityPageProps) => {
  return (
    <>
      <Meta title="Equality and diversity - Apply for a grant" />

      <Layout backBtnUrl={backButtonURL}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={[]}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Does your organisation primarily focus on supporting people with mental or physical disabilities?"
            fieldName="disability"
            fieldErrors={[]}
            radioOptions={[{ label: 'Yes' }, { label: 'No' }]}
            defaultChecked={defaultChecked}
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

export default DisabilityPage;
