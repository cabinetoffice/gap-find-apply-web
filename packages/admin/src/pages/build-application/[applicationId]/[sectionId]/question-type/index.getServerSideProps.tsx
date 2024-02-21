import { GetServerSidePropsContext } from 'next';
import ResponseType, {
  ResponseTypeLabels,
} from '../../../../../enums/ResponseType';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import {
  addFieldsToSession,
  getSummaryFromSession,
  getValueFromSession,
} from '../../../../../services/SessionService';
import { QuestionSummary } from '../../../../../types/QuestionSummary';
import {
  getQuestion,
  patchQuestion,
  postQuestion,
} from '../../../../../services/QuestionService';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';

type RequestBody = {
  responseType: ResponseType;
  _csrf?: string;
};

const redirectQuestionType = [
  ResponseType.Dropdown,
  ResponseType.MultipleSelection,
  ResponseType.LongAnswer,
];

function getRedirect(
  responseType: ResponseType,
  applicationId: string,
  sectionId: string,
  queryString = ''
) {
  const REDIRECT_MAP = {
    [ResponseType.Dropdown]: `/build-application/${applicationId}/${sectionId}/question-options${queryString}`,
    [ResponseType.MultipleSelection]: `/build-application/${applicationId}/${sectionId}/question-options${queryString}`,
    [ResponseType.LongAnswer]: `/build-application/${applicationId}/${sectionId}/question-type/add-word-count${queryString}`,
  };
  return REDIRECT_MAP[responseType as keyof typeof REDIRECT_MAP];
}

const SHORT_QUESTION_WORD_LIMIT = 300;

function getRadio(responseType: ResponseType) {
  if (responseType === ResponseType.Dropdown) return 'Multiple choice';
  if (responseType === ResponseType.MultipleSelection) return 'Multiple select';
  return '';
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { params, req, query } = context;
  const { applicationId, sectionId } = params as Record<string, string>;
  const { questionId, backTo } = query;
  const queryString = backTo
    ? `?${new URLSearchParams({ backTo: backTo.toString() })}`
    : '';

  const sessionId = getSessionIdFromCookies(req);
  console.log('start ', questionId, backTo, sessionId);

  const handleRequest = async (body: RequestBody) => {
    console.log('request start', questionId);
    const { _csrf, ...props } = body;

    console.log('request qid', questionId, body);

    const questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionId
    )) as QuestionSummary;
    const { optional, ...restOfQuestionSummary } = questionSummary;

    console.log('request picking', questionId, body, questionSummary);
    if (questionId) {
      if (redirectQuestionType.includes(body.responseType)) {
        console.log('adding fields to session', body);
        await addFieldsToSession('updatedQuestion', props, sessionId);
        return {
          redirectQuestionType: body.responseType,
        };
      }
      console.log('patching q');

      const patchres = await patchQuestion(
        sessionId,
        applicationId,
        sectionId,
        questionId.toString(),
        {
          ...body,
          ...props,
          validation: {
            mandatory: optional !== 'true',
            maxWords: '',
          },
        }
      );
      console.log('patchres', patchres);

      return {
        data: 'QUESTION_UPDATED',
        sessionId,
      };
    } else {
      if (redirectQuestionType.includes(body.responseType)) {
        await addFieldsToSession('newQuestion', props, sessionId);
        return {
          redirectQuestionType: body.responseType,
        };
      }

      await postQuestion(sessionId, applicationId, sectionId, {
        ...restOfQuestionSummary,
        ...props,
      });

      return {
        data: 'QUESTION_SAVED',
        sessionId,
      };
    }
  };

  const onSuccessRedirectHref = (
    response: Awaited<ReturnType<typeof handleRequest>>
  ) => {
    if (response.redirectQuestionType) {
      const queryString =
        Object.keys(query).length > 0
          ? '?' + new URLSearchParams(query as Record<string, string>)
          : '';
      return getRedirect(
        response.redirectQuestionType,
        applicationId,
        sectionId,
        queryString
      );
    }
    return response.data === 'QUESTION_SAVED'
      ? `/build-application/${applicationId}/${sectionId}`
      : `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content${queryString}`;
  };

  const fetchPageData = async (sessionCookie: string) => {
    const applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      sessionCookie
    );

    const responseType = await getValueFromSession(
      'newQuestion',
      'responseType',
      sessionCookie
    );
    let defaultRadio = getRadio(responseType);

    if (questionId) {
      const questionData = await getQuestion(
        sessionId,
        applicationId,
        sectionId,
        questionId.toString()
      );
      if (questionData?.responseType) {
        defaultRadio = ResponseTypeLabels[questionData.responseType];
      }
    }

    const sectionName = applicationFormSummary.sections.find(
      (section) => section.sectionId === sectionId
    )?.sectionTitle;

    return {
      sectionName,
      defaultRadio,
      backButtonHref: questionId
        ? `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content${queryString}`
        : `/build-application/${applicationId}/${sectionId}/question-content`,
    };
  };

  return QuestionPageGetServerSideProps({
    serviceErrorReturnUrl: `/build-application/${applicationId}/dashboard`,
    context,
    fetchPageData,
    onSuccessRedirectHref,
    onErrorMessage: `Something went wrong while trying to ${
      questionId ? 'edit' : 'create'
    } the question.`,
    handleRequest,
    jwt: sessionId,
    isEdit: questionId !== undefined,
  });
};
