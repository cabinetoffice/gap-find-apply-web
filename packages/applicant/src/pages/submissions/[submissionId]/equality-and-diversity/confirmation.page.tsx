import getConfig from 'next/config';
import Layout from '../../../../components/partials/Layout';
import Meta from '../../../../components/partials/Meta';

const EqualityAndDiversityConfirmationPage = () => {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Equality and diversity - Apply for a grant" />

      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div
              className="govuk-panel govuk-panel--confirmation"
              data-testid="confirmation-panel"
            >
              <h1 className="govuk-panel__title">
                Your answers have been submitted
              </h1>
            </div>

            <h2 className="govuk-heading-m govuk-!-margin-top-7">Thank you</h2>

            <p className="govuk-body">
              Thanks for helping us understand who the grant will benefit.
            </p>
            <p className="govuk-body">
              Your answers will not affect your application.
            </p>
            <p className="govuk-body">
              The funding organisation will contact you once they have reviewed
              your application.
            </p>

            <a
              href={`${publicRuntimeConfig.subPath}/applications`}
              role="button"
              draggable="false"
              className="govuk-button govuk-!-margin-top-4"
              data-module="govuk-button"
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
};

export default EqualityAndDiversityConfirmationPage;
