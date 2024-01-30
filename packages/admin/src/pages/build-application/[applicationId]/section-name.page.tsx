import React from 'react';
import { GetServerSideProps, Redirect } from 'next';
import {
  FlexibleQuestionPageLayout,
  TextInput,
  Button,
  ValidationError,
} from 'gap-web-ui';

import callServiceMethod from '../../../utils/callServiceMethod';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import Meta from '../../../components/layout/Meta';
import { postSection } from '../../../services/SectionService';
import CustomLink from '../../../components/custom-link/CustomLink';
import { getSessionIdFromCookies } from '../../../utils/session';

type RequestBody = {
  sectionTitle: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const { applicationId } = params as Record<string, string>;
  const sessionId = getSessionIdFromCookies(req);
  const errorPageParams = {
    errorInformation:
      'Something went wrong while trying to create the section.',
    linkAttributes: {
      href: `/build-application/${applicationId}/dashboard`,
      linkText: 'Please return',
      linkInformation: ' and try again.',
    },
  };
  const errorPageRedirect = {
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify(
        errorPageParams
      )}`,
      statusCode: 302,
    } as Redirect,
  };

  let fieldErrors: ValidationError[] = [];

  const result = await callServiceMethod(
    req,
    res,
    (body: RequestBody) => postSection(sessionId, applicationId, body),
    (sectionId) => `/build-application/${applicationId}/${sectionId}`,
    errorPageParams
  );

  if ('redirect' in result) {
    return result;
  } else if ('body' in result) {
    fieldErrors = result.fieldErrors;
  }

  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err) {
    return errorPageRedirect;
  }

  const applicationName = applicationFormSummary.applicationName;

  return {
    props: {
      fieldErrors,
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: process.env.SUB_PATH + resolvedUrl,
      pageCaption: applicationName,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const SectionNameContent = ({
  fieldErrors,
  backButtonHref,
  formAction,
  pageCaption,
  csrfToken,
}: SectionNameProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Add new section - Manage a grant`}
      />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          pageCaption={pageCaption}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle="Give this section a name"
            questionHintText="Applicants will see the title on their application form."
            fieldName="sectionTitle"
            fieldErrors={fieldErrors}
            defaultValue=""
          />

          <Button text="Save and continue" />
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

interface SectionNameProps {
  fieldErrors: ValidationError[];
  backButtonHref: string;
  formAction: string;
  pageCaption: string;
  csrfToken: string;
}
export default SectionNameContent;
