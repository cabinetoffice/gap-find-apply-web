import { QuestionPageLayout, ValidationError } from 'gap-web-ui';
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
import { errorPageParams } from './newSchemeServiceError';

type RequestBody = {
  name: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
  res,
}) => {
  const sessionId = req.cookies.session_id;
  const sessionCookie = getSessionIdFromCookies(req);

  const {
    backButtonHref = '/dashboard',
    successRedirect = '/new-scheme/ggis-reference',
  } = query as Record<string, string>;

  let body: RequestBody | undefined;
  let fieldErrors = [] as ValidationError[];

  const result = await callServiceMethod(
    req,
    res,
    (body: RequestBody) =>
      addToSession('newScheme', 'name', body.name, sessionCookie),
    successRedirect,
    errorPageParams
  );

  if ('redirect' in result) {
    // If we successfully added the name to the session, redirect to the ggis-reference page
    // If adding the name to the session failed, and the cause was NOT a validation error, redirect to the service error page
    return result;
  } else if ('body' in result) {
    // If adding the name to the session failed due to a validation error, pass these errors to the page
    fieldErrors = result.fieldErrors;
    body = result.body;
  }

  let defaultValue = '';
  if (body) {
    defaultValue = body.name;
  } else if (sessionId) {
    defaultValue = await getValueFromSession(
      'newScheme',
      'name',
      sessionCookie
    );
  }

  const { publicRuntimeConfig } = getConfig();
  return {
    props: {
      fieldErrors: fieldErrors,
      formAction: `${publicRuntimeConfig.SUB_PATH}/new-scheme/name?backButtonHref=${backButtonHref}&successRedirect=${successRedirect}`,
      backButtonHref: backButtonHref,
      defaultValue: defaultValue,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const SchemeName = ({
  fieldErrors,
  formAction,
  backButtonHref,
  defaultValue,
  csrfToken,
}: SchemeQuestionPage) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Scheme name - Add a grant - Manage a grant`}
      />

      <CustomLink
        isBackButton
        dataCy="cy_nameQuestionPageBackButton"
        href={backButtonHref}
      />

      <div className="govuk-!-padding-top-7">
        <QuestionPageLayout
          formAction={formAction}
          questionTitle="What is the name of your grant?"
          fieldName="name"
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
          inputType={{
            type: 'text-input',
            defaultValue: defaultValue,
          }}
          buttons={[{ text: 'Save and continue' }]}
        />
      </div>
    </>
  );
};

export default SchemeName;
