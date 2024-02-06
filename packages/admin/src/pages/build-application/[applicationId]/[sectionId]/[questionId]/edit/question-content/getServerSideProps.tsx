import { GetServerSidePropsContext } from 'next';
import { getApplicationFormSummary } from '../../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../../services/QuestionService';
import { getSessionIdFromCookies } from '../../../../../../../utils/session';
import QuestionPageGetServerSideProps from '../../../../../../../utils/QuestionPageGetServerSideProps';
import { NextRedirect } from '../../../../../../../utils/QuestionPageGetServerSidePropsTypes';

type RequestBody = {
  fieldTitle: string;
  hintText: string;
  optional: string;
  maxWords?: string;
};

const getServerSideProps = (context: GetServerSidePropsContext) => {
  const { applicationId, sectionId, questionId } = context.params as Record<
    string,
    string
  >;
  const { backTo } = context.query as Record<string, string>;

  function onSuccessRedirectHref() {
    return backTo === 'dashboard'
      ? `/build-application/${applicationId}/dashboard`
      : `/build-application/${applicationId}/${sectionId}`;
  }

  async function fetchPageData(jwt: string) {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      jwt
    );

    if (applicationFormSummary.applicationStatus === 'PUBLISHED') {
      return {
        redirect: {
          destination: `/build-application/${applicationId}/${sectionId}/${questionId}/preview`,
          statusCode: 302,
        },
      } as NextRedirect;
    }

    const questionData = await getQuestion(
      jwt,
      applicationId,
      sectionId,
      questionId
    );

    return {
      questionData,
      backTo: backTo ?? '',
      backButtonHref: onSuccessRedirectHref(),
      deleteConfirmationUrl: `/build-application/${applicationId}/${sectionId}/${questionId}/delete-confirmation`,
    };
  }

  async function handleRequest(body: RequestBody, jwt: string) {
    const { optional, maxWords, ...restOfBody } = body;

    return patchQuestion(jwt, applicationId, sectionId, questionId, {
      ...restOfBody,
      validation: {
        mandatory: optional !== 'true',
        maxWords,
      },
    });
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onSuccessRedirectHref,
    onErrorMessage: 'Failed to edit question. Please try again.',
  });
};

export default getServerSideProps;
