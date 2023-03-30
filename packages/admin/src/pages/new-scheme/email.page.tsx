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
  contactEmail: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  query,
}) => {
  const sessionId = req.cookies.session_id;
  const sessionCookie = getSessionIdFromCookies(req);

  const {
    backButtonHref = '/new-scheme/ggis-reference',
    successRedirect = '/new-scheme/summary',
  } = query as Record<string, string>;

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
        'contactEmail',
        body.contactEmail,
        sessionCookie
      ),
    successRedirect,
    errorPageParams
  );

  if ('redirect' in result) {
    // If we successfully added the email to the session, redirect to the summary page
    // If adding the email to the session failed, and the cause was NOT a validation error, redirect to the service error page
    return result;
  } else if ('body' in result) {
    // If adding the email to the session failed due to a validation error, pass these errors to the page
    fieldErrors = result.fieldErrors;
    body = result.body;
  }

  let defaultValue = '';
  if (body) {
    defaultValue = body.contactEmail;
  } else if (sessionId) {
    defaultValue = await getValueFromSession(
      'newScheme',
      'contactEmail',
      sessionCookie
    );
  }

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      fieldErrors: fieldErrors,
      formAction: `${publicRuntimeConfig.SUB_PATH}/new-scheme/email?backButtonHref=${backButtonHref}&successRedirect=${successRedirect}`,
      backButtonHref: backButtonHref,
      defaultValue: defaultValue,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const SchemeEmail = ({
  fieldErrors,
  backButtonHref,
  formAction,
  defaultValue,
  csrfToken,
}: SchemeQuestionPage) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Support email - Add a grant - Manage a grant`}
      />

      <CustomLink
        isBackButton
        href={backButtonHref}
        dataCy="cy_emailQuestionPageBackButton"
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Enter the email address you want to use for support"
            questionHintText="Enter the address people can contact if they need support. You can change this later if you need to."
            fieldName="contactEmail"
            fieldErrors={fieldErrors}
            defaultValue={defaultValue}
            textInputSubtype="email"
          />
          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default SchemeEmail;
