import {
  Button,
  FlexibleQuestionPageLayout,
  TextInput,
  ValidationError,
} from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import {
  addToSession,
  getValueFromSession,
} from '../../services/SessionService';
import SchemeQuestionPage from '../../types/SchemeQuestionPage';
import callServiceMethod from '../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../utils/session';
import { errorPageParams, serviceErrorRedirect } from './newSchemeServiceError';

type RequestBody = {
  ggisReference: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const sessionId = req.cookies.session_id;
  const {
    backButtonHref = '/new-scheme/name',
    successRedirect = '/new-scheme/email',
  } = query as Record<string, string>;
  const sessionCookie = getSessionIdFromCookies(req);

  if (!sessionId) {
    return serviceErrorRedirect;
  }

  let body: RequestBody | undefined;
  let fieldErrors = [] as ValidationError[];
  const result = await callServiceMethod(
    req,
    res,
    (body: RequestBody) =>
      addToSession(
        'newScheme',
        'ggisReference',
        body.ggisReference,
        sessionCookie
      ),
    successRedirect,
    errorPageParams
  );

  if ('redirect' in result) {
    // If we successfully added the ggis reference to the session, redirect to the email page
    // If adding the ggis reference to the session failed, and the cause was NOT a validation error, redirect to the service error page
    return result;
  } else if ('body' in result) {
    // If adding the ggis reference to the session failed due to a validation error, pass these errors to the page
    fieldErrors = result.fieldErrors;
    body = result.body;
  }

  let defaultValue = '';
  if (body) {
    defaultValue = body.ggisReference;
  } else if (sessionId) {
    defaultValue = await getValueFromSession(
      'newScheme',
      'ggisReference',
      sessionCookie
    );
  }

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      fieldErrors: fieldErrors,
      formAction: `${publicRuntimeConfig.SUB_PATH}/new-scheme/ggis-reference?backButtonHref=${backButtonHref}&successRedirect=${successRedirect}`,
      backButtonHref: backButtonHref,
      defaultValue: defaultValue,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const SchemeGGiSReference = ({
  fieldErrors,
  formAction,
  backButtonHref,
  defaultValue,
  csrfToken,
}: SchemeQuestionPage) => {
  const questionHint = (
    <>
      <p>
        GGIS stands for the Government Grant Information System. It holds the
        official list of all grants available across government.
      </p>
      <CustomLink
        href="https://grantshub.civilservice.gov.uk/ggis/s/login/?ec=302&startURL=%2Fggis%2Fs%2F"
        excludeSubPath
      >
        Where can I find my GGIS Scheme Reference Number?
      </CustomLink>
    </>
  );

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }GGIS reference - Add a grant - Manage a grant`}
      />

      <CustomLink
        isBackButton
        href={backButtonHref}
        dataCy="cy_GGISQuestionPageBackButton"
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter your GGIS Scheme Reference Number"
            questionHintText={questionHint}
            fieldName="ggisReference"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default SchemeGGiSReference;
