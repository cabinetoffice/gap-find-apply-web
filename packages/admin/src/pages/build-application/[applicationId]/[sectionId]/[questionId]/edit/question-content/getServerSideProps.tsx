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
  const sessionId = getSessionIdFromCookies(context.req);
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

  async function fetchPageData() {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      sessionId
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
      sessionId,
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

  async function handleRequest(body: RequestBody) {
    const { optional, maxWords, ...restOfBody } = body;

    return patchQuestion(sessionId, applicationId, sectionId, questionId, {
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
    jwt: sessionId,
    onSuccessRedirectHref,
    onErrorMessage: 'Failed to edit question. Please try again.',
  });
};

export default getServerSideProps;
