import { FlexibleQuestionPageLayout, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { updateApplicationFormStatus } from '../../../services/ApplicationService';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../utils/session';
import { errorPageParams } from './publish-service-errors';

type RequestBody = {
  confirmation: string;
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  resolvedUrl,
  req,
  res,
}) => {
  const { applicationId } = params as Record<string, string>;

  let fieldErrors = [] as ValidationError[];
  const response = await callServiceMethod(
    req,
    res,
    async (body: RequestBody) => {
      if (body.confirmation === 'true') {
        await updateApplicationFormStatus(
          applicationId,
          'PUBLISHED',
          getSessionIdFromCookies(req)
        );
        return true;
      } else if (body.confirmation === 'false') {
        // do nothing, redirect back to overview
        return false;
      } else {
        // imitating a validation error from the backend if the user hasn't selected an option
        return Promise.reject({
          response: {
            data: {
              fieldErrors: [
                {
                  fieldName: 'confirmation',
                  errorMessage: 'You must select an option',
                },
              ],
            },
          },
        });
      }
    },
    (published) => {
      if (published) {
        return `/build-application/${applicationId}/publish-success`;
      }
      return `/build-application/${applicationId}/dashboard`;
    },
    errorPageParams(applicationId, true)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
  }

  return {
    props: {
      backHref: `/build-application/${applicationId}/dashboard`,
      formAction: process.env.SUB_PATH + resolvedUrl,
      fieldErrors: fieldErrors,
      csrfToken: res.getHeader('x-csrf-token') as string,
    },
  };
};

const PublishConfirmationPage = ({
  backHref,
  formAction,
  fieldErrors,
  csrfToken,
}: PublishConfirmationPageProps) => {
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Publish your application form - Manage a grant`}
      />

      <CustomLink isBackButton href={backHref} />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Are you sure you want to publish your application form?"
            questionHintText={
              <p className="govuk-body">
                Once published, you will be given a URL for this application
                form, which can be added to your grant advert.
              </p>
            }
            fieldName="confirmation"
            fieldErrors={fieldErrors}
          />
          <div className="govuk-button-group">
            <button
              className="govuk-button"
              data-module="govuk-button"
              data-cy="cy_publishConfirmation-ConfirmButton"
            >
              Confirm
            </button>

            <CustomLink href={backHref}>Cancel</CustomLink>
          </div>
        </FlexibleQuestionPageLayout>
      </div>
    </>
  );
};

type PublishConfirmationPageProps = {
  backHref: string;
  formAction: string;
  fieldErrors: ValidationError[];
  csrfToken: string;
};

export default PublishConfirmationPage;
