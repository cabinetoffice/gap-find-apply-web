import { ValidationError } from '../../types';
import CallServiceMethod from './CallServiceMethod';
import { Redirect } from 'next';

import {
  QuestionPageGetServerSidePropsType,
  PostPageResultProps,
  PageBodyResponse,
  FetchPageData,
  generateValidationPropsType,
  NextRedirect,
} from './QuestionPageGetServerSidePropsTypes';

/**
 * Abstracts away how we handle redirects, fetch & update data.
 *
 * @template T - The type of the pages body when posting all the fields in its form
 * @template K - The response of the 'fetchPageData' function
 * @template V - The response of the 'handleRequest' function
 *
 * @param context - GetServerSidePropsContext
 * @param fetchPageData - A function that takes in a jwt and returns data asynchronously
 * @param handleRequest - A function that takes in a jwt and the body the page returns, then updates/posts this data
 * @param jwt - A JWT needed for calls to the backend
 * @param onSuccessRedirectHref - Where to redirect to after successfully updating data
 * @param onErrorMessage - An error message to display if getting/updating data fails
 *
 * @returns A redirect to the relevant location, or a set of props needed to load a page
 */

export default async function QuestionPageGetServerSideProps<
  T extends PageBodyResponse,
  K extends FetchPageData,
  V
>(props: QuestionPageGetServerSidePropsType<T, K, V>) {
  const { context, fetchPageData, jwt } = props;
  const { req, resolvedUrl } = context;

  const pageData = await fetchAndHandlePageData(
    fetchPageData,
    jwt,
    resolvedUrl
  );

  if ('redirect' in pageData) {
    return pageData as NextRedirect;
  }

  const postResponse = await postPagesResult({
    ...props,
    ...context,
  });

  if ((postResponse as { redirect: Redirect })?.redirect) {
    return postResponse;
  }

  const { fieldErrors, previousValues } = generateValidationProps(
    postResponse as { body: PageBodyResponse; fieldErrors: ValidationError[] }
  );

  const shouldUsePostResponseData = !fieldErrors.length && postResponse;

  return {
    props: {
      csrfToken: (req as any).csrfToken?.() || ('' as string),
      formAction: resolvedUrl,
      fieldErrors,
      pageData: shouldUsePostResponseData ? postResponse : pageData,
      previousValues,
    },
  };
}

async function fetchAndHandlePageData<K extends FetchPageData>(
  fetchPageData: (jwt: string) => Promise<K>,
  jwt: string,
  resolvedUrl: string
) {
  try {
    return await fetchPageData(jwt);
  } catch (err: any) {
    if (err?.response?.data?.code) {
      return generateRedirect(
        `/error-page/code/${err.response.data.code}?href=${resolvedUrl}`
      );
    }
    return generateServiceErrorRedirect(
      'Something went wrong while trying to load this page.',
      resolvedUrl
    );
  }
}

async function postPagesResult<T extends PageBodyResponse, V>({
  req,
  res,
  handleRequest,
  jwt,
  onSuccessRedirectHref,
  onErrorMessage,
  resolvedUrl,
  usePostRequestForPageData,
}: PostPageResultProps<T, V>) {
  return CallServiceMethod<T, V>(
    req,
    res,
    (body) => handleRequest(body, jwt),
    onSuccessRedirectHref,
    generateServiceErrorProps(onErrorMessage, resolvedUrl),
    usePostRequestForPageData
  );
}

function generateValidationProps<T extends PageBodyResponse>(
  response: generateValidationPropsType<T>
) {
  let fieldErrors = [] as ValidationError[];
  let previousValues: T | null = null;
  if (response && 'fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    previousValues = response.body;
  }
  return { fieldErrors, previousValues };
}

export function generateRedirect(destination: string): NextRedirect {
  return {
    redirect: {
      destination,
      statusCode: 302,
    },
  };
}

export function generateServiceErrorRedirect(
  errorMessage: string,
  resolvedUrl: string
): NextRedirect {
  return {
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify(
        generateServiceErrorProps(errorMessage, resolvedUrl)
      )}`,
      statusCode: 302,
    },
  };
}

function generateServiceErrorProps(errorMessage: string, resolvedUrl: string) {
  return {
    errorInformation: errorMessage,
    linkAttributes: {
      href: resolvedUrl,
      linkText: 'Please return',
      linkInformation: ' and try again.',
    },
  };
}
