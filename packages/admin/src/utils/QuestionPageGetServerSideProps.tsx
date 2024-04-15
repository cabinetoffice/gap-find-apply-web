import { Redirect } from 'next';
import CallServiceMethod from './callServiceMethod';
import {
  ValidationError,
  QuestionPageGetServerSidePropsType,
  PostPageResultProps,
  PageBodyResponse,
  FetchPageData,
  generateValidationPropsType,
  NextRedirect,
} from './QuestionPageGetServerSidePropsTypes';
import { handleMultipleEditorsError } from './serviceErrorHelpers';

/**
 * Abstracts away how we handle redirects, fetch & update data.
 *
 * @template T - The type of the pages body when posting all the fields in its form
 * @template K - The response of the 'fetchPageData' function
 * @template V - The response of the 'handleRequest' function
 *
 *
 * @param props
 * @returns A redirect to the relevant location, or a set of props needed to load a page
 */

export default async function QuestionPageGetServerSideProps<
  T extends PageBodyResponse,
  K extends FetchPageData,
  V
>(props: QuestionPageGetServerSidePropsType<T, K, V>) {
  const { context, fetchPageData, jwt } = props;
  const { res, resolvedUrl } = context;

  const pageData = await fetchAndHandlePageData(
    fetchPageData,
    jwt,
    props.serviceErrorReturnUrl ?? resolvedUrl
  );

  if (pageData instanceof Object && 'redirect' in pageData) {
    return pageData as NextRedirect;
  }

  const postResponse = await postPagesResult({
    ...props,
    ...context,
    pageData,
  });

  if (postResponse && 'redirect' in postResponse) {
    return postResponse;
  }

  const { fieldErrors, previousValues } = generateValidationProps(
    postResponse as Exclude<typeof postResponse, { redirect: Redirect }>
  );

  return {
    props: {
      csrfToken: res.getHeader('x-csrf-token') as string,
      formAction: process.env.SUB_PATH + resolvedUrl,
      fieldErrors,
      pageData,
      previousValues,
    },
  };
}

async function fetchAndHandlePageData<K extends FetchPageData>(
  fetchPageData: (jwt: string) => Promise<K | NextRedirect>,
  jwt: string,
  resolvedUrl: string,
  serviceErrorReturnUrl?: string
) {
  try {
    return await fetchPageData(jwt);
  } catch (err: any) {
    const multipleEditorsRedirect = handleMultipleEditorsError(err);
    if (multipleEditorsRedirect) return multipleEditorsRedirect;

    if (err?.response?.data?.code) {
      return generateRedirect(
        `/error-page/code/${err.response.data.code}?href=${
          serviceErrorReturnUrl ?? resolvedUrl
        }`
      );
    }
    return generateServiceErrorRedirect(
      'Something went wrong while trying to load this page.',
      serviceErrorReturnUrl ?? resolvedUrl
    );
  }
}
async function postPagesResult<
  T extends PageBodyResponse,
  K extends FetchPageData,
  V
>({
  req,
  res,
  handleRequest,
  jwt,
  onSuccessRedirectHref,
  onErrorMessage,
  resolvedUrl,
  pageData,
  serviceErrorReturnUrl,
}: PostPageResultProps<T, K, V>) {
  return CallServiceMethod<T, V>(
    req,
    res,
    (body) => handleRequest(body, jwt, pageData),
    onSuccessRedirectHref,
    generateServiceErrorProps(
      onErrorMessage,
      serviceErrorReturnUrl ?? resolvedUrl
    )
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
