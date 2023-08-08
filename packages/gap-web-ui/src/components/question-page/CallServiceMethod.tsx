import { parseBody } from 'next/dist/server/api-utils/node';
import csurf from 'csurf';
import { GetServerSidePropsContext, Redirect } from 'next';
import { ValidationError } from '../../types';
import { Body, ServiceError } from './CallServiceMethodTypes';
import {
  PageBodyResponse,
  NextRedirect,
} from './QuestionPageGetServerSidePropsTypes';
import { generateRedirect } from './QuestionPageGetServerSideProps';

/**
 * Abstracts away a couple important things:
 * - Anti CSRF tokens. During a GET request, a CSRF cookie is created. When a POST request is then fired
 *   we validate this cookie against the requests hidden csrf token.
 * - Handles different errors after calling a service method function. This is done by either redirecting to the relevant service error page,
 *   or by returning any validation errors & the request body to the page
 *
 * @param req - GetServerSideProps req object
 * @param res - GetServerSideProps res object
 * @param serviceFunc - A function to call the relevant service method (can optionally return something to the redirectTo function)
 * @param redirectTo - A url for where to redirect to, or a function that takes the response of serviceFunc to generate the appropriate url to redirect to
 * @param errorPageParams - A custom ServiceError object
 * @returns Depending on different scenarios, returns the following:
 *          - If the request was NOT a POST, returns void
 *          - If the request was a POST and serviceFunc returned validation errors, returns the body of the request AND a list of validation errors
 *          - If the request was a POST and serviceFunc succeeded, returns a redirect with the redirectTo prop
 *          - If the request was a POST and serviceFunc errored, returns a redirect to a service error page using the errorPageParams props
 */
export default async function CallServiceMethod<B extends PageBodyResponse, R>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
  serviceFunc: (body: B) => Promise<R>,
  redirectTo: string | ((result: R) => string),
  errorPageParams: ServiceError | string,
  usePostRequestForPageData?: boolean
): Promise<
  | { body: B; fieldErrors: ValidationError[] }
  | { redirect: Redirect }
  | void
  | Awaited<R>
> {
  if (req.method !== 'POST') {
    await initialiseCSRFCookie(req, res);
    return;
  }
  let body: Body<B> = await parseBody(req, '1mb');
  try {
    body = removeAllCarriageReturns(body);

    await validateCSRFCookie(req, res, body);

    const result = await serviceFunc(body);

    if (usePostRequestForPageData) {
      return result;
    }

    return generateRedirect(
      typeof redirectTo === 'string' ? redirectTo : redirectTo(result)
    );
  } catch (err: any) {
    const validationErrors = getValidationErrors(err, body);
    if (validationErrors) return validationErrors;
    if (err.code) return generateErrorPageRedirect(err, errorPageParams);
    return generateServiceErrorRedirect(errorPageParams);
  }
}

async function initialiseCSRFCookie(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res']
) {
  await new Promise((resolve, reject) =>
    csurf({ cookie: { secure: true, sameSite: 'strict', httpOnly: true } })(
      req as any,
      res as any,
      (result) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      }
    )
  );
}

async function validateCSRFCookie<T extends PageBodyResponse>(
  req: GetServerSidePropsContext['req'],
  res: GetServerSidePropsContext['res'],
  body: Body<T>
) {
  await new Promise((resolve, reject) =>
    csurf({
      cookie: { secure: true, sameSite: 'strict', httpOnly: true },
      value: () => body._csrf,
    })(req as any, res as any, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    })
  );
}

function removeAllCarriageReturns<B extends PageBodyResponse>(obj: B): B {
  // This needs some explaining... New lines are encoded as CR + LF characters
  // for form data (see https://www.w3.org/MarkUp/html-spec/html-spec_8.html#SEC8.2.1).
  // This means that line breaks are 2 characters instead of 1 by time it reaches Next.js.
  // When we send the data onto Spring as JSON, the string is longer than the count
  // shown to users.
  // parseBody parses the form data into JSON. Here, we go through all properties and
  // strip CR characters from strings, leaving just LF characters, as expected.
  return Object.entries(obj).reduce(
    (acc, [key, value]: [string, string | unknown]) => {
      acc[key] = typeof value === 'string' ? value.replace(/\r/g, '') : value;
      return acc;
    },
    {} as any
  );
}

function getValidationErrors<B extends PageBodyResponse>(
  errors: any,
  body: Body<B>
) {
  const data = errors?.response?.data;
  const fieldErrors = data?.errors || data?.fieldErrors;
  if (fieldErrors) {
    return {
      body,
      fieldErrors: fieldErrors as ValidationError[],
    };
  }
}

function generateErrorPageRedirect(
  err: any,
  errorPageParams: ServiceError | string
): NextRedirect {
  return {
    redirect: {
      destination: `/error-page/code/${err.code}?href=${
        typeof errorPageParams === 'string'
          ? errorPageParams
          : errorPageParams.linkAttributes?.href
      }`,
      statusCode: 302,
    },
  };
}

function generateServiceErrorRedirect(
  errorPageParams: ServiceError | string
): NextRedirect {
  return {
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify(
        errorPageParams
      )}`,
      statusCode: 302,
    },
  };
}
