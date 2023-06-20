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
import { EqualityAndDiversityParams } from '../types';
import { fetchGrantBeneficiary } from './fetchGrantBeneficiary';

export enum OrganisationRadioOptions {
  VCSE = 'Voluntary, community and social enterprise',
  SME = 'Small to medium enterprise',
  NEITHER = 'Neither',
}

type RequestBody = {
  organisation: `${OrganisationRadioOptions}`;
};

export const getServerSideProps: GetServerSideProps<{}, EqualityAndDiversityParams> = async ({
  params,
  resolvedUrl,
  req,
  res,
  query,
}) => {
  const { submissionId, grantBeneficiaryId } = params as Record<string, string>;
  const { returnToSummaryPage } = query as Record<string, string>;
  let defaultChecked = null;

  let grantBeneficiary: GrantBeneficiary;
  try {
    grantBeneficiary = await fetchGrantBeneficiary(submissionId, req);
  } catch (_) {
    return errorPageRedirect(submissionId);
  }

  if (grantBeneficiary.organisationGroup1) defaultChecked = OrganisationRadioOptions.VCSE;
  else if (grantBeneficiary.organisationGroup2) defaultChecked = OrganisationRadioOptions.SME;
  else if (grantBeneficiary.organisationGroup3) defaultChecked = OrganisationRadioOptions.NEITHER;

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.organisation) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            organisationGroup1:
              body.organisation === OrganisationRadioOptions.VCSE,
            organisationGroup2:
              body.organisation === OrganisationRadioOptions.SME,
            organisationGroup3: body.organisation === OrganisationRadioOptions.NEITHER,
          },
          getJwtFromCookies(req),
          grantBeneficiaryId
        );
      }
    },
    returnToSummaryPage
      ? `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/summary`
      : `/submissions/${submissionId}/equality-and-diversity/${grantBeneficiaryId}/sex`,
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
        returnToSummaryPage ? 'summary' : 'sex'
      }`,
      defaultChecked: defaultChecked,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const OrganisationPage = ({
  formAction,
  defaultChecked,
  skipURL,
  csrfToken,
}: OrganisationPageProps) => {
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
            questionTitle="Which type of organisation are you applying for a grant on behalf of?"
            fieldName="organisation"
            fieldErrors={[]}
            radioOptions={Object.values(OrganisationRadioOptions).map((option) => ({
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

export type OrganisationPageProps = {
  formAction: string;
  skipURL: string;
  defaultChecked?: `${OrganisationRadioOptions}`;
  csrfToken: string;
};

export default OrganisationPage;
