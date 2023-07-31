import { FlexibleQuestionPageLayout, Radio, ValidationError } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { updateApplicationFormStatus } from '../../../services/ApplicationService';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getSessionIdFromCookies } from '../../../utils/session';
import { errorPageParams } from './publish-service-errors';
import getConfig from 'next/config';

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
          'REMOVED',
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
    (unpublished) => {
      if (unpublished) {
        return `/build-application/${applicationId}/dashboard?recentlyUnpublished=true`;
      }
      return `/build-application/${applicationId}/dashboard`;
    },
    errorPageParams(applicationId, false)
  );

  if ('redirect' in response) {
    return response;
  } else if ('body' in response) {
    fieldErrors = response.fieldErrors;
  }

  return {
    props: {
      backHref: `/build-application/${applicationId}/dashboard`,
      formAction: resolvedUrl,
      fieldErrors: fieldErrors,
      csrfToken: (req as any).csrfToken?.() || '',
    },
  };
};

const UnpublishConfirmationPage = ({
  backHref,
  formAction,
  fieldErrors,
  csrfToken,
}: PublishConfirmationPageProps) => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Unpublish your application form - Manage a grant`}
      />

      <CustomLink isBackButton href={backHref} />

      <div className="govuk-!-padding-top-7">
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <Radio
            questionTitle="Are you sure you want to unpublish this application form?"
            questionHintText={
              <p className="govuk-body">
                Once unpublished, your application form will no longer appear on{' '}
                <a
                  href={publicRuntimeConfig.FIND_A_GRANT_URL}
                  className="govuk-link"
                >
                  Find a grant
                </a>
                . You will be able to edit the application form and re-publish.
              </p>
            }
            fieldName="confirmation"
            fieldErrors={fieldErrors}
          />
          <div className="govuk-button-group">
            <button
              className="govuk-button"
              data-module="govuk-button"
              data-cy="cy_unpublishConfirmation-ConfirmButton"
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

export default UnpublishConfirmationPage;
