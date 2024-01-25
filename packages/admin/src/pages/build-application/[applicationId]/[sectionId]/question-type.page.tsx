import {
  Button,
  FlexibleQuestionPageLayout,
  Radio,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import ResponseType, {
  ResponseTypeLabels,
} from '../../../../enums/ResponseType';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { postQuestion } from '../../../../services/QuestionService';
import {
  addFieldsToSession,
  getSummaryFromSession,
  getValueFromSession,
} from '../../../../services/SessionService';
import { QuestionSummary } from '../../../../types/QuestionSummary';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../utils/session';
import QuestionTypeHint from './components/QuestionTypeHint';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './newQuestionServiceError';

type RequestBody = {
  responseType: ResponseType;
  _csrf?: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { applicationId, sectionId } = params as Record<string, string>;
  const sessionId = req.cookies.session_id;
  const sessionCookie = getSessionIdFromCookies(req);

  if (!sessionId) {
    // We expect the session ID to be present in order to get to this page
    return questionErrorPageRedirect(applicationId);
  }

  let fieldErrors = [] as ValidationError[];
  const result = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      const { _csrf, ...props } = body;
      if (
        body.responseType === ResponseType.Dropdown ||
        body.responseType === ResponseType.MultipleSelection
      ) {
        return addFieldsToSession(
          'newQuestion',
          props as RequestBody,
          sessionCookie
        );
      } else {
        const questionSummary = (await getSummaryFromSession(
          'newQuestion',
          sessionCookie
        )) as QuestionSummary;
        const { optional, ...restOfQuestionSummary } = questionSummary;

        await postQuestion(sessionId, applicationId, sectionId, {
          ...restOfQuestionSummary,
          ...props,
          validation: { mandatory: optional !== 'true' },
        });

        return {
          data: 'QUESTION_SAVED',
          sessionId,
        };
      }
    },
    (response: { data: any }) => {
      if (response.data === 'QUESTION_SAVED') {
        return `/build-application/${applicationId}/${sectionId}`;
      } else {
        return `/build-application/${applicationId}/${sectionId}/question-options`;
      }
    },
    getErrorPageParams(applicationId)
  );

  if ('redirect' in result) {
    // If we successfully posted the new question, delete sessionId and redirect back to the dashboard
    // If posting failed, and the cause was NOT a validation error, redirect to the service error page
    return result;
  } else if ('body' in result) {
    // If posting failed due to a validation error, pass these errors to the page
    fieldErrors = result.fieldErrors;
  }

  let applicationFormSummary;
  let responseType;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      sessionCookie
    );
    responseType = await getValueFromSession(
      'newQuestion',
      'responseType',
      sessionCookie
    );
  } catch (err) {
    // If we can't fetch the section name from the application form summary, redirect to the service error page
    return questionErrorPageRedirect(applicationId);
  }

  let selectedRadio = '';
  switch (responseType) {
    case ResponseType.Dropdown: {
      selectedRadio = 'Multiple choice';
      break;
    }
    case ResponseType.MultipleSelection: {
      selectedRadio = 'Multiple select';
      break;
    }
  }

  const sectionName = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  )?.sectionTitle;

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      sectionName: sectionName,
      defaultRadio: selectedRadio,
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-content`,
      fieldErrors: fieldErrors,
      formAction: `${publicRuntimeConfig.SUB_PATH}/build-application/${applicationId}/${sectionId}/question-type`,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

type QuestionTypeProps = {
  sectionName: string;
  defaultRadio?: string;
  backButtonHref: string;
  formAction: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

const QuestionType = ({
  sectionName,
  defaultRadio,
  backButtonHref,
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
                    description="Can have a maximum of 250 characters entered."
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
                    description="Can have a maximum of 6000 characters entered."
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
