import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import ResponseType from '../../../../../enums/ResponseType';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { questionErrorPageRedirect } from '../newQuestionServiceError';
import {
  addFieldsToSession,
  getSummaryFromSession,
  getValueFromSession,
} from '../../../../../services/SessionService';
import { QuestionSummary } from '../../../../../types/QuestionSummary';
import { postQuestion } from '../../../../../services/QuestionService';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import QuestionPageGetServerSideProps from '../../../../../utils/QuestionPageGetServerSideProps';
import ResponseTypeEnum from '../../../../../enums/ResponseType';

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
  sectionId: string
) {
  const REDIRECT_MAP = {
    [ResponseType.Dropdown]: `/build-application/${applicationId}/${sectionId}/question-options`,
    [ResponseType.MultipleSelection]: `/build-application/${applicationId}/${sectionId}/question-options`,
    [ResponseType.LongAnswer]: `/build-application/${applicationId}/${sectionId}/question-type/add-word-count`,
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
  const { params, req } = context;
  const { applicationId, sectionId } = params as Record<string, string>;

  const sessionId = req.cookies.session_id;
  const sessionCookie = getSessionIdFromCookies(req);

  if (!sessionId) {
    // We expect the session ID to be present in order to get to this page
    return questionErrorPageRedirect(applicationId);
  }

  const handleRequest = async (body: RequestBody) => {
    const { _csrf, ...props } = body;

    if (redirectQuestionType.includes(body.responseType)) {
      await addFieldsToSession('newQuestion', props, sessionCookie);
      return {
        redirectQuestionType: body.responseType,
      };
    }

    const questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionCookie
    )) as QuestionSummary;
    const { optional, ...restOfQuestionSummary } = questionSummary;
    const maxWords =
      body.responseType === ResponseType.ShortAnswer
        ? SHORT_QUESTION_WORD_LIMIT
        : undefined;

    await postQuestion(sessionId, applicationId, sectionId, {
      ...restOfQuestionSummary,
      ...props,
      validation: {
        maxWords,
        mandatory: optional !== 'true',
      },
    });

    return {
      data: 'QUESTION_SAVED',
      sessionId,
    };
  };

  const onSuccessRedirectHref = (
    response: Awaited<ReturnType<typeof handleRequest>>
  ) => {
    if (response.redirectQuestionType) {
      return getRedirect(
        response.redirectQuestionType,
        applicationId,
        sectionId
      );
    }
    return `/build-application/${applicationId}/${sectionId}`;
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

    const sectionName = applicationFormSummary.sections.find(
      (section) => section.sectionId === sectionId
    )?.sectionTitle;

    return {
      sectionName,
      defaultRadio: getRadio(responseType),
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-content`,
    };
  };

  return QuestionPageGetServerSideProps({
    serviceErrorReturnUrl: `/build-application/${applicationId}/dashboard`,
    fetchPageDataErrorHandler: () => questionErrorPageRedirect(applicationId),
    context,
    fetchPageData,
    onSuccessRedirectHref,
    onErrorMessage: 'Something went wrong while trying to create the question.',
    handleRequest,
    jwt: sessionCookie,
  });
};
