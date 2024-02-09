import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import getConfig from 'next/config';
import { toWordsOrdinal } from 'number-to-words';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';
import {
  ApplicationFormQuestion,
  ApplicationFormSummary,
} from '../../../../../../types/ApplicationForm';
import { QuestionWithOptionsSummary } from '../../../../../../types/QuestionSummary';
import callServiceMethod from '../../../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import OptionsQuestionSummary from '../../components/OptionsQuestionSummary';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './editQuestionServiceError';
import InferProps from '../../../../../../types/InferProps';
import { NextRedirect } from '../../../../../../utils/QuestionPageGetServerSidePropsTypes';

export const getServerSideProps = async ({
  params,
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  const { backTo } = query as Record<string, string>;

  function getBackToRedirect() {
    return backTo === 'dashboard'
      ? `/build-application/${applicationId}/dashboard`
      : `/build-application/${applicationId}/${sectionId}`;
  }

  let fieldErrors: ValidationError[] = [];
  let options: string[] = [''];
  let applicationFormSummary: ApplicationFormSummary;
  let questionData: ApplicationFormQuestion;
  let questionSummary: QuestionWithOptionsSummary;

  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );

    if (applicationFormSummary.applicationStatus === 'PUBLISHED') {
      return {
        redirect: {
          destination: `/build-application/${applicationId}/${sectionId}/${questionId}/preview`,
          statusCode: 302,
        },
      } as NextRedirect;
    }
    questionData = await getQuestion(
      sessionId,
      applicationId,
      sectionId,
      questionId
    );

    questionSummary = {
      fieldTitle: questionData.fieldTitle,
      hintText: questionData.hintText,
      optional: (!questionData.validation.mandatory).toString(),
      responseType: questionData.responseType,
    };
  } catch (err) {
    return questionErrorPageRedirect(applicationId);
  }

  const sectionName = applicationFormSummary.sections.find(
    (section) => section.sectionId === sectionId
  )?.sectionTitle;

  const result = await callServiceMethod(
    req,
    res,
    async (body: any) => {
      options = Object.keys(body).reduce((array, key) => {
        if (key.startsWith('options')) {
          array.push(...body[key]);
        }

        if (key.startsWith('delete_')) {
          const deleteOptionIndex = Number(key.split('_')[1]);
          array.splice(deleteOptionIndex, 1);
        }
        return array;
      }, [] as string[]);

      switch (true) {
        case 'add-another-option' in body:
          options.push('');

          return {
            data: 'OPTION_ADDED',
          };

        case 'save-and-continue' in body:
          await patchQuestion(sessionId, applicationId, sectionId, questionId, {
            options: options,
          });

          return {
            data: 'QUESTION_SAVED',
          };

        default:
          return {
            data: 'OPTION_REMOVED',
          };
      }
    },
    (response: { data: string }) => {
      return response.data === 'QUESTION_SAVED' ? getBackToRedirect() : '';
    },
    getErrorPageParams(applicationId)
  );

  if ('redirect' in result) {
    if (result.redirect.destination !== '') {
      return result;
    }
  } else if ('body' in result) {
    //The backend currently returns 2 forms of errors, Class level or field level
    fieldErrors = result.fieldErrors
      .reduce((array, error) => {
        //To remain GDS compliant we need to link each error to the fields which caused the validation error.
        //here we catch class level errors and return individual errors to link to each field
        if (error.fieldName === 'options') {
          const newElementErrors = options.map(
            (_option, index) =>
              ({
                fieldName: `options[${index}]`,
                errorMessage: error.errorMessage,
              } as ValidationError)
          );
          array.push(...newElementErrors);
        } else if (error.fieldName.startsWith('options')) {
          //Here we catch field level errors and update the backend fieldName to match the frontend fieldName
          array.push({
            fieldName: error.fieldName.split('.')[0],
            errorMessage: error.errorMessage,
          });
        }
        return array;
      }, [] as ValidationError[])
      .sort((a, b) =>
        a.fieldName.localeCompare(b.fieldName, undefined, { numeric: true })
      );
  }
  if (req.method !== 'POST') {
    options = questionData.options as string[];
  }
  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      pageCaption: sectionName,
      questionSummary,
      backButtonHref: `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content?backTo=${backTo}`,
      formAction: `${publicRuntimeConfig.SUB_PATH}/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options?backTo=${backTo}`,
      fieldErrors,
      cancelChangesHref: getBackToRedirect(),
      options,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const QuestionOptions = ({
  pageCaption,
  questionSummary,
  backButtonHref,
  formAction,
  cancelChangesHref,
  fieldErrors,
  options,
  csrfToken,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Edit a question - Manage a grant`}
      />

      <CustomLink
        href={backButtonHref}
        dataCy="cy_questionOptionsPage-backButton"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          pageCaption={pageCaption}
          csrfToken={csrfToken}
        >
          <OptionsQuestionSummary questionSummary={questionSummary} />

          {options.map((option: string, index: number) => {
            return (
              <TextInput
                key={index}
                questionTitle={`Enter the ${toWordsOrdinal(index + 1)} option`}
                titleSize="m"
                fieldName={`options[${index}]`}
                defaultValue={option}
                fieldErrors={fieldErrors}
                fluidWidth="three-quarters"
                TitleTag={'h2'}
              >
                {options.length > 2 && (
                  <button
                    name={`delete_${index}`}
                    className="button--tertiary govuk-!-margin-left-3"
                    aria-label={`Delete the ${toWordsOrdinal(
                      index + 1
                    )} option`}
                    data-module="govuk-button"
                    data-cy={`cy_questionOptions-deleteOption-${index + 1}`}
                  >
                    Delete
                  </button>
                )}
              </TextInput>
            );
          })}

          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-grid-row">
              <Button
                text="Add another option"
                isSecondary={true}
                addNameAttribute={true}
              />
            </div>
            <div className="govuk-grid-row govuk-button-group">
              <Button
                text="Save and continue"
                addNameAttribute={true}
                data-cy="cy_questionOptions-SaveAndContinueButton"
              />
              <CustomLink
                href={cancelChangesHref}
                dataCy="cy_questionOptions-cancelLink"
              >
                Cancel
              </CustomLink>
            </div>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default QuestionOptions;
