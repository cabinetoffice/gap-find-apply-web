import csurf from 'csurf';
import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext, Redirect } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import { ServiceError } from '../pages/service-error/index.page';

type Body<T> = T & {
  _csrf: string;
};

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
  errorPageParams: ServiceError
): Promise<
  | { body: B; fieldErrors: ValidationError[] }
  | { redirect: Redirect }
  | { nonPost: true }
> {
  // When we are NOT posting to the same page, initialise the csrf cookie and immediately return
  if (req.method !== 'POST') {
    await initialiseCSRFCookie(req, res);
    return { nonPost: true };
  }
  // Otherwise, validate the CSRF cookie & call the service method
  let body: Body<B>;
  try {
    body = await parseBody(req, '1mb');
    body = removeAllCarriageReturns(body);

    await validateCSRFCookie(req, res, body);

    handleMandatoryQuestionFundingLocationAndOrgTypeSpecialCases<B>(req, body);

    const result = await serviceFunc(body);
    return {
      redirect: {
        destination:
          typeof redirectTo === 'string' ? redirectTo : redirectTo(result),
        statusCode: 302,
      },
    };
  } catch (err: any) {
    console.log('err', err);
    // If there is a validation error
    if (err.response?.data?.errors) {
      return {
        body: body!,
        fieldErrors: err.response.data.errors as ValidationError[],
      };
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

// Special case for the Mandatory Questions..

export function handleMandatoryQuestionFundingLocationAndOrgTypeSpecialCases<
  B extends Record<string, any>
>(
  req: GetServerSidePropsContext['req'],
  body: (Body<B> & FundingLocationBody) | (Body<B> & OrgTypeBody)
) {
  if (req.url === undefined) {
    return;
  }
  // funding location case (if only one checkbox has been selected, the backend needs the result to be a list of strings,
  // if nothing has been selected, the backend needs an empty list, so validation can kick in)
  if (
    req.url.startsWith('/mandatory-questions') &&
    req.url
      .split('/')
      .pop()
      .split('?')[0]
      .endsWith('organisation-funding-location')
  ) {
    if ('fundingLocation' in body) {
      const fundingLocation = body.fundingLocation;
      if (typeof fundingLocation === 'string') {
        body.fundingLocation = [fundingLocation];
      }
    } else {
      body.fundingLocation = [];
    }
  }

  // org type case (no radio button have been selected, meaning that in the body there won't be any orgType property,
  //so we need to add it with an empty string value, so the validation can kick in)
  if (
    req.url.startsWith('/mandatory-questions') &&
    req.url.split('/').pop().split('?')[0].endsWith('organisation-type')
  ) {
    if (body.orgType === undefined) {
      body.orgType = '';
    }
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

async function validateCSRFCookie<T extends Record<string, string>>(
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

type FundingLocationBody = {
  fundingLocation?: string | string[];
};

type OrgTypeBody = {
  orgType?: string;
};
