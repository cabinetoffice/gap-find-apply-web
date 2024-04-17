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
import { buildQueryStringWithoutUndefinedValues } from '../../../../../utils/general';

type RequestBody = {
  responseType: ResponseType;
  _csrf?: string;
};

const SHORT_QUESTION_WORD_LIMIT = 300;

const redirectQuestionType = [
  ResponseType.Dropdown,
  ResponseType.MultipleSelection,
  ResponseType.LongAnswer,
];

function getRedirectForCreate(
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

function getRedirectForEdit(
  responseType: ResponseType,
  applicationId: string,
  sectionId: string,
  questionId: string,
  queryString = ''
) {
  const REDIRECT_MAP = {
    [ResponseType.Dropdown]: `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options${queryString}`,
    [ResponseType.MultipleSelection]: `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options${queryString}`,
    [ResponseType.LongAnswer]: `/build-application/${applicationId}/${sectionId}/question-type/add-word-count${queryString}`,
  };
  return REDIRECT_MAP[responseType as keyof typeof REDIRECT_MAP];
}

function getRedirect(
  responseType: ResponseType,
  applicationId: string,
  sectionId: string,
  questionId: string,
  queryString = ''
) {
  return questionId
    ? getRedirectForEdit(
        responseType,
        applicationId,
        sectionId,
        questionId,
        queryString
      )
    : getRedirectForCreate(responseType, applicationId, sectionId, queryString);
}

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
  const queryString = buildQueryStringWithoutUndefinedValues({ backTo });

  const sessionId = getSessionIdFromCookies(req);

  const handleRequest = async (body: RequestBody) => {
    const { _csrf, ...props } = body;

    const questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionId
    )) as QuestionSummary;
    const { optional, ...restOfQuestionSummary } = questionSummary;

    if (redirectQuestionType.includes(body.responseType)) {
      await addFieldsToSession(
        questionId ? 'updatedQuestion' : 'newQuestion',
        props,
        sessionId
      );
      return {
        redirectQuestionType: body.responseType,
      };
    }

    const maxWords =
      body.responseType === ResponseType.ShortAnswer
        ? SHORT_QUESTION_WORD_LIMIT
        : undefined;

    if (questionId) {
      await patchQuestion(
        sessionId,
        applicationId,
        sectionId,
        questionId.toString(),
        {
          ...body,
          ...props,
          validation: {
            mandatory: optional !== 'true',
            maxWords: maxWords,
          },
        }
      );

      return {
        data: 'QUESTION_UPDATED',
        sessionId,
      };
    } else {
      await postQuestion(sessionId, applicationId, sectionId, {
        ...restOfQuestionSummary,
        ...props,
        validation: {
          mandatory: optional !== 'true',
          maxWords,
        },
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
      const queryString = buildQueryStringWithoutUndefinedValues({
        ...query,
        from: 'question-type',
      });
      return getRedirect(
        response.redirectQuestionType,
        applicationId,
        sectionId,
        questionId as string,
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
      isEdit: questionId !== undefined,
      version: applicationFormSummary.audit.version,
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
  });
};
