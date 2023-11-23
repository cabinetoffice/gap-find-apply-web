import { FlexibleQuestionPageLayout, Radio } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Layout from '../../../../../components/partials/Layout';
import Meta from '../../../../../components/partials/Meta';
import { GrantBeneficiary } from '../../../../../types/models/GrantBeneficiary';
import { postGrantBeneficiaryResponse } from '../../../../../services/GrantBeneficiaryService';
import callServiceMethod from '../../../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import {
  errorPageParams,
  errorPageRedirect,
} from '../equality-and-diversity-service-errors';
import { EqualityAndDiversityParams } from '../types';
import { fetchGrantBeneficiary } from './fetchGrantBeneficiary';
import { NextIncomingMessage } from 'next/dist/server/request-meta';

export enum OrganisationRadioOptions {
  VCSE = 'Voluntary, community, or social enterprise (VCSE)',
  SME = 'Small or medium-sized enterprise (SME)',
  NEITHER = 'Neither of these',
}

type RequestBody = {
  organisation: `${OrganisationRadioOptions}`;
};

type Req = NextIncomingMessage & {
  csrfToken: () => string;
  cookies: Partial<{
    [key: string]: string;
  }>;
};

export type OrganisationPageProps = {
  formAction: string;
  skipURL: string;
  defaultChecked?: `${OrganisationRadioOptions}`;
  csrfToken: string;
};

const getDefaultChecked = (grantBeneficiary: GrantBeneficiary) => {
  if (grantBeneficiary.organisationGroup1) return OrganisationRadioOptions.VCSE;
  else if (grantBeneficiary.organisationGroup2)
    return OrganisationRadioOptions.SME;
  else if (grantBeneficiary.organisationGroup3)
    return OrganisationRadioOptions.NEITHER;
  return null;
};

export const getServerSideProps: GetServerSideProps<
  OrganisationPageProps,
  EqualityAndDiversityParams
> = async ({ params, resolvedUrl, req, res, query }) => {
  const { submissionId, grantBeneficiaryId } = params;
  const { returnToSummaryPage } = query;

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
      if (body.organisation) {
        await postGrantBeneficiaryResponse(
          {
            submissionId: submissionId,
            hasProvidedAdditionalAnswers: true,
            organisationGroup1:
              body.organisation === OrganisationRadioOptions.VCSE,
            organisationGroup2:
              body.organisation === OrganisationRadioOptions.SME,
            organisationGroup3:
              body.organisation === OrganisationRadioOptions.NEITHER,
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
      defaultChecked: getDefaultChecked(grantBeneficiary),
      csrfToken: (req as Req).csrfToken() || '',
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
            questionTitle="Which of these options best describes your organisation?"
            fieldName="organisation"
            fieldErrors={[]}
            radioOptions={Object.values(OrganisationRadioOptions).map(
              (option) => ({
                label: option,
                value: option,
              })
            )}
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

export default OrganisationPage;
