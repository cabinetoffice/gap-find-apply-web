import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import {
  hasSubmissionBeenSubmitted,
  isSubmissionReady,
  submit,
} from '../../../services/SubmissionService';
import callServiceMethod from '../../../utils/callServiceMethod';
import { getJwtFromCookies } from '../../../utils/jwt';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const submissionId = params.submissionId.toString();
  const jwt = getJwtFromCookies(req);
  const submissionReady = await isSubmissionReady(submissionId, jwt);
  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(submissionId, jwt);

  const response = await callServiceMethod(
    req,
    res,
    () => submit(submissionId, jwt),
    `/submissions/${submissionId}/equality-and-diversity`,
    {
      errorInformation:
        'Something went wrong while trying to submit your application',
      linkAttributes: {
        href: `/submissions/${submissionId}/submit`,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    }
  );
  if ('redirect' in response) {
    return response;
  }

  if (!submissionReady || hasBeenSubmitted) {
    return {
      redirect: {
        destination: `/submissions/${submissionId}/sections`,
        statusCode: 302,
      },
    };
  }

  return {
    props: { submissionId, csrfToken: (req as any).csrfToken?.() || '' },
  };
};

function SubmitApplication({ submissionId, csrfToken }) {
  return (
    <>
      <Meta title="Submit application - Apply for a grant" />

      <Layout backBtnUrl={`/submissions/${submissionId}/summary`}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form
              action={`${publicRuntimeConfig.subPath}/submissions/${submissionId}/submit`}
              method="POST"
            >
              <h1
                className="govuk-heading-l"
                id="main-content-focus"
                tabIndex={-1}
                data-cy="cy-confirm-submit-submission-title"
              >
                Are you sure you want to submit this application?
              </h1>
              <p
                className="govuk-body"
                data-cy="cy-confirm-submit-submission-hint"
              >
                You will not be able to make changes to your application after
                this has been submitted.
              </p>

              <input type="hidden" name="_csrf" value={csrfToken} />

              <div className="govuk-button-group">
                <button
                  className="govuk-button"
                  data-module="govuk-button"
                  data-cy="cy-confirm-submit-submission-button"
                >
                  Yes, submit this application
                </button>
                <Link href={`/submissions/${submissionId}/sections`}>
                  <a
                    className="govuk-link govuk-!-font-size-19 govuk-link--no-visited-state"
                    data-cy="cy-cancel-submission"
                  >
                    Cancel
                  </a>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default SubmitApplication;
