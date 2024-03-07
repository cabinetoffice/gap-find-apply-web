import {
  Button,
  ErrorBanner,
  FlexibleQuestionPageLayout,
  Radio,
  TextArea,
  ValidationError,
} from 'gap-web-ui';

import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import React from 'react';

import Meta from '../../../../../components/layout/Meta';
import { postSurveyResponse } from '../../../../../services/SatisfactionSurveyService';
import InferProps from '../../../../../types/InferProps';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';

type PageBodyResponse = {
  satisfaction: string;
  comment: string;
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { schemeId } = context.params as Record<string, string>;

  const satisfaction = context.query.satisfaction
    ? decodeURIComponent(context.query.satisfaction as string)
    : null;

  const comment = context.query.comment
    ? decodeURIComponent(context.query.comment as string)
    : null;

  const url = `${getConfig().serverRuntimeConfig.backendHost}/feedback/add`;

  async function handleRequest(body: PageBodyResponse, jwt: string) {
    await postSurveyResponse(
      body.satisfaction,
      body.comment,
      jwt,
      url,
      'advert'
    );
  }

  async function fetchPageData() {
    return {
      satisfaction: satisfaction,
      comment: comment,
      journey: 'advert',
    };
  }

  return QuestionPageGetServerSideProps<
    PageBodyResponse,
    Awaited<ReturnType<typeof fetchPageData>>,
    Awaited<ReturnType<typeof handleRequest>>
  >({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onErrorMessage: 'Did not send feedback.',
    onSuccessRedirectHref: () => {
      return `/scheme/${schemeId}`;
    },
  });
}

const Survey = ({
  csrfToken,
  formAction,
  fieldErrors,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0
            ? `Error - ${fieldErrors[0].errorMessage} - `
            : ''
        }Satisfaction survey - Manage a grant`}
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
          <h1 className="govuk-heading-l" tabIndex={-1}>
            Give feedback on Manage a grant
          </h1>
          <h2 className="govuk-heading-m" tabIndex={-1}>
            Satisfaction survey
          </h2>

          <FlexibleQuestionPageLayout
            formAction={formAction}
            fieldErrors={fieldErrors}
            csrfToken={csrfToken}
            fullPageWidth={true}
          >
            <Radio
              TitleTag="h1"
              fieldErrors={[]}
              fieldName="satisfaction"
              questionTitle="Overall, how did you feel about the service you received today?"
              titleSize="s"
              radioOptions={[
                {
                  label: 'Very satisfied',
                  value: '5',
                },
                {
                  label: 'Satisfied',
                  value: '4',
                },
                {
                  label: 'Neither satisfied nor dissatisfied',
                  value: '3',
                },
                {
                  label: 'Dissatisfied',
                  value: '2',
                },
                {
                  label: 'Very dissatisfied',
                  value: '1',
                },
              ]}
            />
            <TextArea
              defaultValue=""
              fieldErrors={[]}
              fieldName="comment"
              questionHintText="Do not include personal or financial information, like your National Insurance number or credit card details"
              questionTitle="How could we improve this service?"
              titleSize="s"
              rows={5}
            />
            <Button text="Send feedback" />
          </FlexibleQuestionPageLayout>
        </div>
      </div>
    </>
  );
};

export default Survey;
