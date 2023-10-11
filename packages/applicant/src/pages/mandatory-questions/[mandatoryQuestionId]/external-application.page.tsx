import Link from 'next/link';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';

const ExternalApplicationSignpost = () => {
  return (
    <>
      <Meta title="Now leaving GOV.UK - Apply for a grant" />

      <Layout
        isUserLoggedIn={false}
        backBtnUrl={'/mandatory-questions/[mandatoryQuestionId]/summary'}
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
            >
              You are now leaving GOV.UK
            </h1>
            <p className="govuk-body">
              Thank you for providing us with information on your grant
              application. We will use this information to help us understand
              the demand for this grant.
            </p>
            <p className="govuk-body">
              The application form for this grant is not managed by GOV.UK. When
              you continue, you will be directed to another website. You may
              need to log in or sign up to this website to continue your
              application.
            </p>
            <Link href={'externalApplicationUrl'}>
              <a
                role="button"
                draggable="false"
                className="govuk-button"
                data-module="govuk-button"
                data-cy="cy-apply-external-application-button"
              >
                Continue to application form
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ExternalApplicationSignpost;
