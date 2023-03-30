import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../components/partials/Layout';
import Meta from '../components/partials/Meta';

export const getServerSideProps: GetServerSideProps = () => {
  return Promise.resolve({
    props: {
      loginUrl: process.env.LOGIN_URL,
      registerUrl: `${process.env.USER_SERVICE_URL}/register`,
    },
  });
};

type HomePageProps = {
  loginUrl: string;
  registerUrl: string;
};

function HomePage({ loginUrl, registerUrl }: HomePageProps) {
  return (
    <>
      <Meta title="Register to apply - Apply for a grant" />
      <Layout isUserLoggedIn={false}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l" data-cy="cy-apply-header">
              Find a Grant
            </h1>
            <p className="govuk-body" data-cy="cy-apply-description">
              Use this service to apply for a government grant.
            </p>
            <p className="govuk-body" data-cy="cy-apply-hint-text">
              During your application you will be asked questions that help
              funding organisations make a decision about who to award funding
              to.
            </p>
            <p className="govuk-body">
              If you have an account you can sign in. If you do not have an
              account you can register for one.
            </p>
            <Link href={registerUrl}>
              <a
                role="button"
                draggable="false"
                className="govuk-button govuk-button--start govuk-heading-m govuk-!-margin-bottom-4"
                data-module="govuk-button"
                data-cy="cy-apply-register-button"
              >
                Register
                <svg
                  className="govuk-button__start-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="17.5"
                  height="19"
                  viewBox="0 0 33 40"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                </svg>
              </a>
            </Link>
            <hr className="govuk-section-break"></hr>
            <a
              href={loginUrl}
              className="govuk-link govuk-link--no-visited-state govuk-!-font-size-19"
              data-cy="cy-apply-existing-account-link"
            >
              I already have an account
            </a>

            <h2
              className="govuk-heading-m govuk-!-margin-top-8"
              data-testid="find-a-grant-heading"
              data-cy="cy-find-a-grant-header"
            >
              Browse grants
            </h2>
            <p className="govuk-body" data-cy="cy-find-a-grant-description">
              Before you can apply, you will need to find a grant that you want
              to apply for.
            </p>
            <a
              href="https://www.find-government-grants.service.gov.uk/"
              className="govuk-link govuk-link--no-visited-state govuk-!-font-size-19"
              data-testid="find-a-grant-link"
              data-cy="cy-find-a-grant-link"
            >
              Browse grants
            </a>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default HomePage;
