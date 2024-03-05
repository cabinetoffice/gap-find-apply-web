import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import { toWordsOrdinal } from 'number-to-words';
import CustomLink from '../../../../components/custom-link/CustomLink';
import Meta from '../../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import { postQuestion } from '../../../../services/QuestionService';
import { getSummaryFromSession } from '../../../../services/SessionService';
import { ApplicationFormSummary } from '../../../../types/ApplicationForm';
import { QuestionWithOptionsSummary } from '../../../../types/QuestionSummary';
import callServiceMethod from '../../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../../utils/session';
import OptionsQuestionSummary from './components/OptionsQuestionSummary';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './newQuestionServiceError';

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const { applicationId, sectionId } = params as Record<string, string>;
  const sessionId = req.cookies.session_id;
  const sessionCookie = getSessionIdFromCookies(req);

  let fieldErrors: ValidationError[] = [];
  let options: string[] = [''];
  let applicationFormSummary: ApplicationFormSummary;
  let questionSummary: QuestionWithOptionsSummary;

  if (!sessionId) {
    return questionErrorPageRedirect(applicationId);
  }

  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
    questionSummary = (await getSummaryFromSession(
      'newQuestion',
      sessionCookie
    )) as unknown as QuestionWithOptionsSummary;
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
      options = body.options;

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

      if ('add-another-option' in body) {
        options.push('');

        return {
          data: 'OPTION_ADDED',
        };
      } else if ('save-question' in body) {
        const { optional, ...restOfQuestionSummary } = questionSummary;

        await postQuestion(
          getSessionIdFromCookies(req),
          applicationId,
          sectionId,
          {
            options,
            ...restOfQuestionSummary,
            validation: { mandatory: optional !== 'true' },
          }
        );

        return {
          data: 'QUESTION_SAVED',
        };
      } else {
        return {
          data: 'OPTION_REMOVED',
        };
      }
    },
    (response: { data: string }) => {
      return response.data === 'QUESTION_SAVED'
        ? `/build-application/${applicationId}/${sectionId}`
        : '';
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

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      sectionName,
      questionSummary,
      backButtonHref: `/build-application/${applicationId}/${sectionId}/question-type`,
      fieldErrors,
      formAction: `${publicRuntimeConfig.SUB_PATH}/build-application/${applicationId}/${sectionId}/question-options`,
      options,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const QuestionOptions = ({
  sectionName,
  questionSummary,
  backButtonHref,
  formAction,
  fieldErrors,
  options,
  csrfToken,
}: QuestionOptionProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Add a question - Manage a grant`}
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
          pageCaption={sectionName}
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
                TitleTag="h2"
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
            <div className="govuk-grid-row">
              <Button text="Save question" addNameAttribute={true} />
            </div>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

type QuestionOptionProps = {
  sectionName: string;
  questionSummary: QuestionWithOptionsSummary;
  backButtonHref: string;
  formAction: string;
  fieldErrors: ValidationError[];
  options: string[];
  csrfToken: string;
};

export default QuestionOptions;
