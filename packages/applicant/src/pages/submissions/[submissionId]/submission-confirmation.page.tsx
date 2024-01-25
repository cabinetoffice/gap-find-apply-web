import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import { GetServerSideProps } from 'next';
import getConfig from 'next/config';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};

function SubmissionConfirmation() {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Application submitted - Apply for a grant" />

      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1
                className="govuk-panel__title"
                data-cy="cy-application-submitted-banner"
              >
                Application submitted
              </h1>
            </div>

            <h2
              className="govuk-heading-m govuk-!-margin-top-6"
              data-cy="cy-application-submitted-header"
            >
              What happens next
            </h2>
            <p
              className="govuk-body govuk-!-margin-bottom-6"
              data-cy="cy-application-submitted-description"
            >
              The funding organisation will contact you once they have reviewed
              your application.
            </p>

            <a
              href={`${publicRuntimeConfig.subPath}/applications`}
              role="button"
              draggable="false"
              className="govuk-button"
              data-module="govuk-button"
              data-cy="cy-application-submitted-view-applications-link"
            >
              View your applications
            </a>

            <p className="govuk-body">
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeZnNVCqmtnzfZQJSBW_k9CklS2Y_ym2GRt-z0-1wf9pDEgPw/viewform"
                target="_blank"
                className="govuk-link"
                rel="noreferrer"
              >
                Tell us what did you think of this service?
              </a>{' '}
              (takes 30 seconds)
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default SubmissionConfirmation;
