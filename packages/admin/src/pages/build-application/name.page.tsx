import { QuestionPageLayout, ValidationError } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import React from 'react';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import { createNewApplicationForm } from '../../services/ApplicationService';
import { findApplicationFormFromScheme } from '../../services/SchemeService';
import ServiceError from '../../types/ServiceError';
import callServiceMethod from '../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../utils/session';

type RequestBody = {
  applicationName: string;
};

const errorPageParams: ServiceError = {
  errorInformation:
    'Something went wrong while trying to create a new application form.',
  linkAttributes: {
    href: '/dashboard',
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
};

const redirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps=${JSON.stringify(
      errorPageParams
    )}`,
    permanent: false,
  },
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
  res,
  resolvedUrl,
}) => {
  const { grantSchemeId } = query as Record<string, string>;

  let fieldErrors = [] as ValidationError[];
  let defaultValue = null;

  if (!grantSchemeId) return redirectObject;

  const applicationForms = await findApplicationFormFromScheme(
    grantSchemeId as string,
    getSessionIdFromCookies(req)
  );

  if (applicationForms.length > 0) return redirectObject;

  const response = await callServiceMethod(
    req,
    res,
    (body: RequestBody) =>
      createNewApplicationForm(
        grantSchemeId,
        body.applicationName,
        getSessionIdFromCookies(req)
      ),
    (applicationId) => `/build-application/${applicationId}/dashboard`,
    errorPageParams
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
    defaultValue = response.body.applicationName;
  }

  return {
    props: {
      fieldErrors: fieldErrors,
      backButtonHref: `/scheme/${grantSchemeId}`,
      formAction: resolvedUrl,
      defaultValue: defaultValue,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const ApplicationName = ({
  fieldErrors,
  backButtonHref,
  formAction,
  defaultValue,
  csrfToken,
}: SchemeNameProps) => {
  const questionHintText = (
    <>
      <p>Applicants will see this name on the application form.</p>
      <p>
        Choose a name that is specific to your grant. For example,
        &quot;Chargepoint scheme for landlords - phase 2&quot;
      </p>
    </>
  );
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Build an application form - Manage a grant`}
      />

      <CustomLink
        href={backButtonHref}
        dataCy="cyBackBuildApplicationName"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <QuestionPageLayout
          formAction={formAction}
          questionTitle="Give this application a name"
          questionHintText={questionHintText}
          fieldName="applicationName"
          fieldErrors={fieldErrors}
          inputType={{
            type: 'text-input',
            defaultValue: defaultValue,
          }}
          buttons={[{ text: 'Continue' }]}
          csrfToken={csrfToken}
        />
      </div>
    </>
  );
};

interface SchemeNameProps {
  fieldErrors: ValidationError[];
  backButtonHref: string;
  formAction: string;
  defaultValue?: string;
  csrfToken: string;
}

export default ApplicationName;
