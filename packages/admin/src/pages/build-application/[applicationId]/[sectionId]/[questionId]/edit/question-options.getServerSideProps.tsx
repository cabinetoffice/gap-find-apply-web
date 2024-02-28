import { GetServerSidePropsContext } from 'next';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import { ValidationError } from 'gap-web-ui';
import {
  ApplicationFormQuestion,
  ApplicationFormSummary,
} from '../../../../../../types/ApplicationForm';
import { QuestionWithOptionsSummary } from '../../../../../../types/QuestionSummary';
import { getApplicationFormSummary } from '../../../../../../services/ApplicationService';
import { NextRedirect } from '../../../../../../utils/QuestionPageGetServerSidePropsTypes';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../services/QuestionService';
import {
  getErrorPageParams,
  questionErrorPageRedirect,
} from './editQuestionServiceError';
import callServiceMethod from '../../../../../../utils/callServiceMethod';
import getConfig from 'next/config';
import { getSummaryFromSession } from '../../../../../../services/SessionService';
import { buildQueryStringWithoutUndefinedValues } from '../../../../../../utils/general';

const getServerSideProps = async ({
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
  const { backTo, from } = query as Record<string, string>;

  function getBackToRedirect() {
    if (from === 'question-type') {
      const queryString = buildQueryStringWithoutUndefinedValues({ backTo });
      return `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content${queryString}`;
    }
    return backTo === 'dashboard'
      ? `/build-application/${applicationId}/dashboard`
      : `/build-application/${applicationId}/${sectionId}`;
  }

  function getBackButtonHref() {
    if (from === 'question-type') {
      const queryString = buildQueryStringWithoutUndefinedValues({
        backTo,
        questionId,
        sectionId,
      });
      return `/build-application/${applicationId}/${sectionId}/question-type${queryString}`;
    }
    const queryString = buildQueryStringWithoutUndefinedValues({
      backTo,
    });
    return `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content${queryString}`;
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
          questionSummary =
            ((await getSummaryFromSession(
              'updatedQuestion',
              sessionId
            )) as unknown as QuestionWithOptionsSummary) || {};
          await patchQuestion(sessionId, applicationId, sectionId, questionId, {
            ...questionSummary,
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
  if (req.method !== 'POST' && questionData.options) {
    options = questionData.options as string[];
  }
  const { publicRuntimeConfig } = getConfig();
  const formActionQueryString = buildQueryStringWithoutUndefinedValues({
    backTo,
    from,
  });
  return {
    props: {
      pageCaption: sectionName,
      questionSummary,
      backButtonHref: getBackButtonHref(),
      formAction: `${publicRuntimeConfig.SUB_PATH}/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-options${formActionQueryString}`,
      fieldErrors,
      cancelChangesHref: from === 'question-type' ? '' : getBackToRedirect(),
      options,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

export default getServerSideProps;
