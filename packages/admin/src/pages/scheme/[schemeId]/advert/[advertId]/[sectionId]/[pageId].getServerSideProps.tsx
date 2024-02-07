import { AxiosError } from 'axios';
import { htmlToRichText } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import {
  getAdvertSectionPageContent,
  patchAdvertSectionPage,
} from '../../../../../../services/AdvertPageService';
import {
  GetAdvertSectionPageContentResponse,
  PatchAdvertSectionPageResponseBody,
} from '../../../../../../services/AdvertPageService.d';
import CustomError from '../../../../../../types/CustomError';
import callServiceMethod from '../../../../../../utils/callServiceMethod';
import {
  generateErrorPageParams,
  generateErrorPageRedirectV2,
} from '../../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../../utils/session';

export const getServerSideProps = async ({
  req,
  res,
  params,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { schemeId, advertId, sectionId, pageId } = params as Record<
    string,
    string
  >;
  const sessionCookie = getSessionIdFromCookies(req);

  // Fetch page contents from the backend
  let serviceResponse;
  try {
    serviceResponse = await getAdvertSectionPageContent(
      sessionCookie,
      advertId,
      sectionId,
      pageId
    );
  } catch (exception) {
    const error = exception as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;

    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/scheme/${schemeId}/advert/${advertId}/section-overview`
    );
  }
  const pageContent = serviceResponse;

  // Replaces section numbering to match design. So, '1. Section one' turns to 'Sectio one'
  pageContent.sectionName = pageContent.sectionName.replace(
    /^([\d]+\.?\s)/,
    ''
  );
  // Call service method & handle patching the new updated questions
  const result = await callServiceMethod<
    Record<string, string | string[]>,
    boolean
  >(
    req,
    res,
    // When we post to this page, handle what we do with the forms data
    async (body) => {
      await patchAdvertSectionPage(
        sessionCookie,
        advertId,
        sectionId,
        pageId,
        await createBody(pageContent, body)
      );
      return body.hasOwnProperty('saveAndContinue');
    },
    // Handles where to redirect to upon a successful PATCH request
    (isSaveAndContinue) =>
      isSaveAndContinue && pageContent.nextPageId
        ? `/scheme/${schemeId}/advert/${advertId}/${sectionId}/${pageContent.nextPageId}`
        : `/scheme/${schemeId}/advert/${advertId}/section-overview`,
    // Handles where to redirect to if the backend errors and it is NOT a validation error
    generateErrorPageParams(
      'Something went wrong while trying to update this question',
      `/scheme/${schemeId}/advert/${advertId}/${sectionId}/${pageId}`
    )
  );

  // Handle service method response
  let body, fieldErrors;
  if ('redirect' in result) {
    return result;
  } else if ('body' in result) {
    fieldErrors = result.fieldErrors;
    body = result.body;
  }
  // Return the relevant props to the page
  return {
    props: {
      ...pageContent,
      csrfToken: res.getHeader('x-csrf-token') as string,
      formAction: process.env.SUB_PATH + resolvedUrl,
      fieldErrors: fieldErrors || [],
      schemeId: schemeId,
      advertId: advertId,
      previousValues: body || null,
      pageId,
    },
  };
};

function getStatus(body: Record<string, string | string[]>) {
  const completed = body.completed;
  if (!completed) return null;
  if (completed === 'Yes') return 'COMPLETED';
  return 'IN_PROGRESS';
}

async function createBody(
  pageContent: GetAdvertSectionPageContentResponse,
  body: Record<string, string | string[]>
): Promise<PatchAdvertSectionPageResponseBody> {
  const questionsArray = await createQuestionsBody(pageContent, body);

  return {
    questions: questionsArray,
    status: getStatus(body),
  };
}

function createQuestionsBody(
  pageContent: GetAdvertSectionPageContentResponse,
  body: Record<string, string | string[]>
) {
  const questions = pageContent.questions.map(async (question) => {
    const requiredProps = {
      id: question.questionId,
      seen: true,
    };
    const response = body[question.questionId];
    const jsDisabled = !!body['jsDisabled'];

    switch (question.responseType) {
      case 'DATE': {
        const dateFields = [
          body[`${question.questionId}-day`] as string,
          body[`${question.questionId}-month`] as string,
          body[`${question.questionId}-year`] as string,
          body[`${question.questionId}-time`] as string,
        ];
        return {
          multiResponse: dateFields,
          ...requiredProps,
        };
      }
      case 'LIST':
        return {
          multiResponse: Array.isArray(response) ? response : [response],
          ...requiredProps,
        };
      case 'RICH_TEXT':
        return {
          multiResponse: [
            jsDisabled ? `<p>${response}</p>` : (response as string),
            JSON.stringify(await htmlToRichText(response as string)),
          ],
          ...requiredProps,
        };

      default:
        return {
          response: response as string,
          ...requiredProps,
        };
    }
  });
  return Promise.all(questions);
}
