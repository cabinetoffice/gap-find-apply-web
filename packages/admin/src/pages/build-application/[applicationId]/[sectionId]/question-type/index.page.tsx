import {
  Button,
  FlexibleQuestionPageLayout,
  Radio,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import ResponseType, {
  ResponseTypeLabels,
} from '../../../../../enums/ResponseType';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import { postQuestion } from '../../../../../services/QuestionService';
import {
  addFieldsToSession,
  getSummaryFromSession,
  getValueFromSession,
} from '../../../../../services/SessionService';
import { QuestionSummary } from '../../../../../types/QuestionSummary';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import QuestionTypeHint from '../components/QuestionTypeHint';
import { questionErrorPageRedirect } from '../newQuestionServiceError';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
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

export const getServerSideProps: GetServerSideProps = async (context) => {
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

  const onSuccessRedirectHref = (response: {
    redirectQuestionType?: ResponseTypeEnum;
  }) => {
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
    try {
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
    } catch (err: unknown) {
      return questionErrorPageRedirect(applicationId);
    }
  };

  return QuestionPageGetServerSideProps({
    serviceErrorReturnUrl: `/build-application/${applicationId}/dashboard`,
    context,
    fetchPageData,
    onSuccessRedirectHref,
    onErrorMessage: 'Something went wrong while trying to create the question.',
    handleRequest,
    jwt: sessionCookie,
  });
};

type QuestionTypeProps = {
  pageData: {
    sectionName: string;
    defaultRadio?: string;
    backButtonHref: string;
  };
  formAction: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

const QuestionType = ({
  pageData: { sectionName, defaultRadio, backButtonHref },
  formAction,
  fieldErrors,
  csrfToken,
}: QuestionTypeProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Add a question - Manage a grant`}
      />

      <CustomLink
        isBackButton
        dataCy="cy_questionType-page-back-button"
        href={backButtonHref}
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={sectionName}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="How would you like this question to be answered?"
            questionHintText="Choose how you would like your question to be answered?"
            fieldName="responseType"
            fieldErrors={fieldErrors}
            defaultChecked={defaultRadio}
            radioOptions={[
              {
                label: ResponseTypeLabels[ResponseType.ShortAnswer],
                hint: (
                  <QuestionTypeHint
                    description="Can have a maximum of 300 words entered."
                    questionType="short-answer"
                    imageFileName="text-input"
                    imageAlt="A screenshot of a text input, with a title and description"
                    detailsTitle="See how a short answer looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.LongAnswer],
                hint: (
                  <QuestionTypeHint
                    description="Can have a maximum of 5000 words entered."
                    questionType="long-answer"
                    imageFileName="text-area"
                    imageAlt="A screenshot of a long text area input, along with a title and description"
                    detailsTitle="See how a long answer looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.YesNo],
                hint: (
                  <QuestionTypeHint
                    description="Allows one option to be selected."
                    questionType="yes-no"
                    imageFileName="radio"
                    imageAlt="A screenshot of a radio input that has a yes and a no option, with a title and description"
                    detailsTitle="See how a Yes/No question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.Dropdown],
                value: 'Dropdown',
                hint: (
                  <QuestionTypeHint
                    description="Allows just one option to be selected from multiple."
                    questionType="dropdown"
                    imageFileName="dropdown"
                    imageAlt="A screenshot of a dropdown input which allows you to select one option, with a title and description"
                    detailsTitle="See how a multiple choice question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.MultipleSelection],
                value: 'MultipleSelection',
                hint: (
                  <QuestionTypeHint
                    description="Allows more than one option to be selected from multiple."
                    questionType="multiple-selection"
                    imageFileName="multiselect"
                    imageAlt="A screenshot of multiple checkbox inputs which allows the user to select multiple options, with a title and description"
                    detailsTitle="See how a multiple select question looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.SingleFileUpload],
                value: ResponseType.SingleFileUpload,
                hint: (
                  <QuestionTypeHint
                    description="Allows files that are .DOC, .DOCX, .ODT, .PDF, .XLS, .XLSX or .ZIP"
                    questionType="document-upload"
                    imageFileName="document-upload"
                    imageAlt="A screenshot of a document upload component, with a button that allows the user to choose a file to upload"
                    detailsTitle="See how document upload looks"
                  />
                ),
              },
              {
                label: ResponseTypeLabels[ResponseType.Date],
                hint: (
                  <QuestionTypeHint
                    description="Allows a DD/MM/YYYY format to be entered."
                    questionType="date"
                    imageFileName="date"
                    imageAlt="A screenshot of a date input (day, month and year), with a title and description"
                    detailsTitle="See how a date question looks"
                  />
                ),
              },
            ]}
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default QuestionType;
