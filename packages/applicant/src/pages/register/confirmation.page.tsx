import Link from 'next/link';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { routes } from '../../utils/routes';

export async function getServerSideProps() {
  return {
    props: {
      loginUrl: process.env.COLA_URL,
    },
  };
}

export default function RegisterConfirmationPage({ loginUrl }) {
  return (
    <>
      <Meta title="Register to apply - Apply for a grant" />
      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <div className="govuk-panel govuk-panel--confirmation">
              <h1
                className="govuk-panel__title"
                data-cy="cy-registration-complete-header"
              >
                Registration complete
              </h1>
            </div>
            <p className="govuk-body">Your account has been created.</p>
            <h2
              className="govuk-heading-m"
              data-cy="cy-applicant-dashboard-applications-subheader"
            >
              What happens next
            </h2>
            <p className="govuk-body">You can sign in to apply for a grant.</p>

            <a
              href={loginUrl}
              className="govuk-body govuk-link govuk-link--no-visited-state"
              data-cy="cy-sign-in-link"
            >
              Sign in
            </a>

            <p className="govuk-body govuk-!-margin-top-4">
              Or you can go back and continue to search for a grant.
            </p>
            <Link href={routes.grants}>
              <a
                className="govuk-body govuk-link govuk-link--no-visited-state"
                data-cy="cy-your-applications-link"
              >
                Find a grant
              </a>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}
