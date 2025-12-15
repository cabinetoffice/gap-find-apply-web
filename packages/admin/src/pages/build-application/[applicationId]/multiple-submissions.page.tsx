import { FlexibleQuestionPageLayout, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { updateApplicationMultipleSubmissions } from '../../../services/ApplicationService';
import ServiceError from '../../../types/ServiceError';
import InferProps from '../../../types/InferProps';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../utils/session';

type RequestBody = {
  allowsMultipleSubmissions: string;
};

const errorPageParams: ServiceError = {
  errorInformation:
    'Something went wrong while trying to update the application settings.',
  linkAttributes: {
    href: '/dashboard',
    linkText: 'Please return',
    linkInformation: ' and try again.',
  },
};

export const getServerSideProps = async ({
  params,
  req,
  res,
  resolvedUrl,
}: GetServerSidePropsContext) => {
  const { applicationId } = params as Record<string, string>;
  const sessionId = getSessionIdFromCookies(req);

  let fieldErrors = [] as ValidationError[];
  let defaultValue: string | null = null;

  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      const allowsMultipleSubmissions =
        body.allowsMultipleSubmissions === 'true';
      await updateApplicationMultipleSubmissions(
        applicationId,
        allowsMultipleSubmissions,
        sessionId
      );
      return allowsMultipleSubmissions;
    },
    () => `/build-application/${applicationId}/dashboard`,
    errorPageParams
  );

  if ('redirect' in response) {
    return response;
  } else if ('fieldErrors' in response) {
    fieldErrors = response.fieldErrors;
    defaultValue = response.body.allowsMultipleSubmissions || null;
  }

  return {
    props: {
      backButtonHref: `/build-application/${applicationId}/dashboard`,
      formAction: process.env.SUB_PATH + resolvedUrl,
      fieldErrors: fieldErrors,
      csrfToken: res.getHeader('x-csrf-token') as string,
      defaultValue: defaultValue,
    },
  };
};

const MultipleSubmissionsPage = ({
  backButtonHref,
  formAction,
  fieldErrors,
  csrfToken,
  defaultValue,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Multiple submissions - Build an application form - Manage a grant`}
      />

      <CustomLink
        href={backButtonHref}
        dataCy="cyBackMultipleSubmissions"
        isBackButton
      />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Can applicants make more than one application?"
            questionHintText={
              <p className="govuk-body">
                This lets the same person apply for this grant more than once.
              </p>
            }
            fieldName="allowsMultipleSubmissions"
            radioOptions={[
              { label: 'Yes, allow multiple applications', value: 'true' },
              { label: 'No, allow only one application', value: 'false' },
            ]}
            fieldErrors={fieldErrors}
            defaultChecked={defaultValue}
          />
          <button
            className="govuk-button"
            data-module="govuk-button"
            data-cy="cy-multiple-submissions-continue-button"
          >
            Continue
          </button>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

export default MultipleSubmissionsPage;
