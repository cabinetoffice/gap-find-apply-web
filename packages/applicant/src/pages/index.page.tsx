import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../components/partials/Layout';
import Meta from '../components/partials/Meta';
import { getLoginUrl } from '../utils/general';
import getConfig from 'next/config';

export const getServerSideProps: GetServerSideProps = () => {
  return Promise.resolve({
    props: {
      loginUrl: getLoginUrl(),
    },
  });
};

type HomePageProps = {
  loginUrl: string;
};

function HomePage({ loginUrl }: HomePageProps) {
  const { publicRuntimeConfig } = getConfig();
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
              You use GOV.UK One Login to sign into Find a grant. If you do not
              have a One Login account already, you will need to create one.
            </p>
            <p className="govuk-body">
              If you have used Find a grant before, you will still be able to
              see all of your information when you register or sign in using One
              Login using the same email address.
            </p>
            <Link href={loginUrl}>
              <a
                role="button"
                draggable="false"
                className="govuk-button govuk-button--start govuk-heading-m govuk-!-margin-bottom-4"
                data-module="govuk-button"
                data-cy="cy-apply-register-button"
              >
                Sign in with One Login
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
              href={`${publicRuntimeConfig.FIND_A_GRANT_URL}/grants`}
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
