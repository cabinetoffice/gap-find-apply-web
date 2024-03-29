import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext, NextApiRequest } from 'next';
import {
  PostQuestionResponse,
  QuestionPostBody,
} from '../services/SubmissionService';
import { routes } from './routes';
import { parseBody } from './parseBody';
import { logger } from './logger';

export function removeAllCarriageReturns<T>(obj: T) {
  // This needs some explaining... New lines are encoded as CR + LF characters
  // for form data (see https://www.w3.org/MarkUp/html-spec/html-spec_8.html#SEC8.2.1).
  // This means that line breaks are 2 characters instead of 1 by time it reaches Next.js.
  // When we send the data onto Spring as JSON, the string is longer than the count
  // shown to users.
  // parseBody parses the form data into JSON. Here, we go through all properties and
  // strip CR characters from strings, leaving just LF characters, as expected.
  return Object.entries(obj).reduce(
    (acc, [key, value]: [string, string | unknown]) => {
      acc[key] = typeof value === 'string' ? value.replaceAll('\r', '') : value;
      return acc;
    },
    {}
  ) as T;
}

//TODO this function needs a major refactor
export default async function postQuestion<B, _R>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
  serviceFunc: (body: QuestionPostBody) => Promise<PostQuestionResponse>,
  submissionId: string,
  sectionId: string,
  questionId: string,
  questionType: string,
  fromSummarySubmissionPage: boolean
): Promise<
  | {
      body: B;
      fieldErrors: ValidationError[];
      values: string[];
      isRefererCheckYourAnswerScreen: boolean;
    }
  | { redirect: { destination: string; statusCode: 302 } }
> {
  let body: any;
  let isRefererCheckYourAnswerScreen: boolean;
  try {
    body = await parseBody(req, res);
    body = removeAllCarriageReturns(body);

    const isCancel = Object.keys(body).indexOf('cancel') !== -1;
    //if i press Cancel, i want to be redirected to the section without saving the response
    if (isCancel) {
      return {
        redirect: {
          destination: routes.submissions.section(submissionId, sectionId),
          statusCode: 302,
        },
      };
    }
    //checks if the "previous page" is the checkYourAnswer one in the body
    isRefererCheckYourAnswerScreen =
      Object.keys(body).indexOf('isRefererCheckYourAnswerScreen') !== -1;

    const shouldRedirectToSummary =
      fromSummarySubmissionPage && body?.ELIGIBILITY !== 'No';

    const backendResponse = await serviceFunc(
      createRequestBody(
        body,
        questionId,
        submissionId,
        questionType,
        shouldRedirectToSummary
      )
    );

    const isResponseAccepted = backendResponse?.responseAccepted;
    const nextNavigation =
      isResponseAccepted && backendResponse?.nextNavigation
        ? backendResponse.nextNavigation
        : null;

    //checks which button has been pressed by checking the body
    const isSaveAndContinue =
      Object.keys(body).indexOf('save-and-continue') !== -1;
    const isSaveAndExit = Object.keys(body).indexOf('save-and-exit') !== -1;

    const shouldContinueToNextQuestion =
      nextNavigation &&
      !nextNavigation?.sectionList &&
      !isRefererCheckYourAnswerScreen;

    if (isResponseAccepted && isSaveAndContinue) {
      let redirectUrl = routes.submissions.section(submissionId, sectionId);

      if (shouldRedirectToSummary) {
        redirectUrl = routes.submissions.summary(submissionId);
      } else if (shouldContinueToNextQuestion) {
        redirectUrl = routes.submissions.question(
          submissionId,
          sectionId,
          nextNavigation.questionId
        );
      }
      return {
        redirect: {
          destination: redirectUrl,
          statusCode: 302,
        },
      };
    }

    if (isSaveAndExit) {
      return {
        redirect: {
          destination: routes.submissions.sections(submissionId),
          statusCode: 302,
        },
      };
    }
  } catch (err) {
    logger.error(
      `Error in postQuestion while processing submission with ID: ${submissionId}`,
      logger.utils.addErrorInfo(err, req as NextApiRequest)
    );
    if (err.response?.data?.errors) {
      const errorsArray: ValidationError[] = [];
      const { errors } = err.response.data;
      errors.map((error: ValidationError) => {
        const key = error.fieldName;
        const value = error.errorMessage;
        switch (questionType) {
          case 'AddressInput':
            errorsArray.push({
              fieldName: convertAddressFieldNameFromErrors(key, questionId),
              errorMessage: value,
            });

            break;
          case 'Date':
            errorsArray.push({
              fieldName: convertDateFieldNameFromErrors(key, questionId, value),
              errorMessage: value,
            });

            break;
          default:
            {
              errorsArray.push({
                fieldName: questionId,
                errorMessage: err.response.data.errors[0]
                  .errorMessage as string,
              });
            }
            break;
        }
      });
      const cleanedBody = body as unknown as CleanedBody;

      return {
        body: body!,
        values: fieldsStartingWithQuestionIdInBody(cleanedBody, questionId).map(
          ([_key, value]) => value
        ),
        fieldErrors: errorsArray,
        isRefererCheckYourAnswerScreen,
      };
    }
  }
}
export interface CleanedBody {
  [key: string]: string;
}
export const fieldsStartingWithQuestionIdInBody = (
  body: CleanedBody,
  questionId: string
): [string, string][] => {
  const regex = new RegExp(questionId);
  return Object.entries(body).filter(([key]) => regex.test(key));
};

export const convertAddressFieldNameFromErrors = (
  errorFieldName: string,
  questionId: string
): string => {
  let fieldName = '';
  switch (errorFieldName) {
    case 'multiResponse[0]':
      fieldName = `${questionId}-address-line-1`;
      break;
    case 'multiResponse[1]':
      fieldName = `${questionId}-address-line-2`;
      break;
    case 'multiResponse[2]':
      fieldName = `${questionId}-town`;
      break;
    case 'multiResponse[3]':
      fieldName = `${questionId}-county`;
      break;
    case 'multiResponse[4]':
      fieldName = `${questionId}-postcode`;
      break;
    default:
      fieldName = questionId;
  }
  return fieldName;
};

export const convertDateFieldNameFromErrors = (
  errorFieldName: string,
  questionId: string,
  errorMessage: string
): string => {
  let fieldName = '';
  switch (errorFieldName) {
    case 'multiResponse':
      {
        fieldName =
          errorMessage === 'You must enter a date'
            ? `${questionId}-date`
            : questionId;
      }
      break;
    case 'multiResponse[0]':
      fieldName = `${questionId}-day`;
      break;
    case 'multiResponse[1]':
      fieldName = `${questionId}-month`;
      break;
    case 'multiResponse[2]':
      fieldName = `${questionId}-year`;
      break;
    default:
      fieldName = questionId;
  }
  return fieldName;
};

export const createRequestBody = (
  body,
  questionId: string,
  submissionId: string,
  questionType: string,
  shouldRedirectToSummary: boolean
): QuestionPostBody => {
  const cleanedBody = body as unknown as CleanedBody;
  const isMultiSelectionQuestion = questionType === 'MultipleSelection';
  const isResponseUndefined =
    fieldsStartingWithQuestionIdInBody(cleanedBody, questionId).length === 0;
  const isResponseAnArray = Array.isArray(body[questionId]);
  const isMultiResponse =
    fieldsStartingWithQuestionIdInBody(cleanedBody, questionId).length > 1;
  const multiResponseValues =
    isMultiResponse || isMultiSelectionQuestion
      ? fieldsStartingWithQuestionIdInBody(cleanedBody, questionId).map(
          ([, value]) => value
        )
      : null;
  const requestBody: QuestionPostBody = {
    response:
      isResponseAnArray ||
      isMultiResponse ||
      isResponseUndefined ||
      isMultiSelectionQuestion
        ? null
        : body[questionId],
    submissionId,
    questionId,
    multiResponse: isResponseAnArray ? body[questionId] : multiResponseValues,
    shouldUpdateSectionStatus: !shouldRedirectToSummary,
  };
  return requestBody;
};
