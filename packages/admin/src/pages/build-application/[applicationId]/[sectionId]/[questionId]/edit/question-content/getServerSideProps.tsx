import { GetServerSidePropsContext } from 'next';
import { getApplicationFormSummary } from '../../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../../services/QuestionService';
import { getSessionIdFromCookies } from '../../../../../../../utils/session';
import QuestionPageGetServerSideProps from '../../../../../../../utils/QuestionPageGetServerSideProps';
import { NextRedirect } from '../../../../../../../utils/QuestionPageGetServerSidePropsTypes';
import ResponseTypeEnum from '../../../../../../../enums/ResponseType';

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

  function getBackToRedirect() {
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

    const editQuestionSearchParams = new URLSearchParams({
      ...context.query,
      questionId,
    });

    return {
      questionData,
      backTo: backTo ?? '',
      backButtonHref: getBackToRedirect(),
      deleteConfirmationUrl: `/build-application/${applicationId}/${sectionId}/${questionId}/delete-confirmation`,
      previewUrl: `/build-application/${applicationId}/${sectionId}/${questionId}/edit/preview`,
      editQuestionTypeUrl: `/build-application/${applicationId}/${sectionId}/question-type?${editQuestionSearchParams}`,
      isEdit: true,
    };
  }

  async function handleRequest(
    body: RequestBody,
    jwt: string,
    pageData: Exclude<Awaited<ReturnType<typeof fetchPageData>>, NextRedirect>
  ) {
    const { optional, maxWords, ...restOfBody } = body;

    await patchQuestion(jwt, applicationId, sectionId, questionId, {
      ...restOfBody,
      validation: {
        mandatory: optional !== 'true',
        maxWords,
      },
    });

    return pageData.questionData.responseType;
  }

  function onSuccessRedirectHref(
    responseType: Awaited<ReturnType<typeof handleRequest>>
  ) {
    return responseType === ResponseTypeEnum.MultipleSelection ||
      responseType === ResponseTypeEnum.Dropdown
      ? `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options?backTo=${backTo}`
      : getBackToRedirect();
  }

  return QuestionPageGetServerSideProps({
    context,
    fetchPageData,
    handleRequest,
    jwt: getSessionIdFromCookies(context.req),
    onSuccessRedirectHref,
    onErrorMessage: 'Something went wrong while trying to update the question.',
  });
};

export default getServerSideProps;
