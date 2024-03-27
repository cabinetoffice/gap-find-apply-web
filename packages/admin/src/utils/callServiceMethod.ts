import { ValidationError } from 'gap-web-ui';
import ServiceError from '../types/ServiceError';
import { parseBody } from './parseBody';
import {
  generateErrorPageAdvertAlreadyPublished,
  generateErrorPageMultipleEditors,
  generateErrorPageRedirectV2,
  handleMultipleEditorsError,
} from './serviceErrorHelpers';
import { GetServerSidePropsContext, Redirect } from 'next';
import { advertIsPublishedOrScheduled } from '../pages/scheme/[schemeId]/advert/[advertId]/summary/components/util';

type Body<T> = T & {
  _csrf: string;
};

/**
 * Handles different errors after calling a service method function. This is done by either redirecting to the relevant service error page,
 * or by returning any validation errors & the request body to the page
 *
 * @param req - GetServerSideProps req object
 * @param res - GetServerSideProps res object
 * @param serviceFunc - A function to call the relevant service method (can optionally return something to the redirectTo function)
 * @param redirectTo - A url for where to redirect to, or a function that takes the response of serviceFunc to generate the appropriate url to redirect to
 * @param errorPageParams -
 *          - If we expect the backend to return a code - this prop should be a URL for where to redirect to after viewing the error page
 *          - If the backend does NOT return a code - this prop should be a custom ServiceError object
 * @returns Depending on different scenarios, returns the following:
 *          - If the request was NOT a POST, returns an object stating it was not a post
 *          - If the request was a POST and serviceFunc returned validation errors, returns the body of the request AND a list of validation errors
 *          - If the request was a POST and serviceFunc succeeded, returns a redirect with the redirectTo prop
 *          - If the request was a POST and serviceFunc errored, returns a redirect to a service error page using the errorPageParams props
 */
export default async function callServiceMethod<
  B extends Record<string, any>,
  R
>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
  serviceFunc: (body: B) => Promise<R>,
  redirectTo: string | ((result: R) => string),
  errorPageParams: ServiceError | string
): Promise<
  | { body: B; fieldErrors: ValidationError[] }
  | { redirect: Redirect }
  | { nonPost: true }
> {
  // return early when we are NOT posting to the same page
  if (req.method !== 'POST') {
    return { nonPost: true };
  }

  // Otherwise, validate the CSRF cookie & call the service method
  let body: Body<B>;
  try {
    body = await parseBody(req, res);
    body = removeAllCarriageReturns(body);

    const result = await serviceFunc(body);
    return {
      redirect: {
        destination:
          typeof redirectTo === 'string' ? redirectTo : redirectTo(result),
        statusCode: 302,
      },
    };
  } catch (err: any) {
    console.log(err);
    // If we encounter an error that conforms to the old way of handling form validation errors
    const data = err?.response?.data;
    const fieldErrors = data?.errors || data?.fieldErrors;
    if (fieldErrors) {
      return {
        body: body!,
        fieldErrors: fieldErrors as ValidationError[],
      };
    }

    if (
      err?.response?.data?.error?.message === 'GRANT_ADVERT_MULTIPLE_EDITORS'
    ) {
      const url = req.url as string;
      const [, , schemeId, , advertId] = url.split('/');
      return generateErrorPageAdvertAlreadyPublished(schemeId, advertId);
    }

    // If we want to display the Multiple Editors error page
    const multipleEditorsErrorRedirect = handleMultipleEditorsError(err);
    if (multipleEditorsErrorRedirect) return multipleEditorsErrorRedirect;

    // If we encounter an error that conforms to the new way of handling form validation errors
    if (err.code) {
      return generateErrorPageRedirectV2(err.code, errorPageParams);
    }

    // If the error is not related to form validation
    return {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify(
          errorPageParams
        )}`,
        statusCode: 302,
      },
    };
  }
}

function removeAllCarriageReturns<T extends Record<string, string>>(obj: T) {
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
    {} as any
  ) as T;
}
