import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { GetServerSideProps } from 'next';
import { routes } from '../../utils/routes';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      oneLoginUrl: process.env.ONE_LOGIN_SECURITY_URL,
    },
  };
};

type SignInDetailsProps = {
  oneLoginUrl: string;
};

const SignInDetails = ({ oneLoginUrl }: SignInDetailsProps) => {
  return (
    <>
      <Meta title="Your sign in details - Apply for a grant" />

      <Layout backBtnUrl={routes.dashboard}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
              data-cy="cy-sign-in-details-header"
            >
              Your sign in details
            </h1>
            <p className="govuk-body">
              You use your GOV.UK One Login to sign in to Find a grant.
            </p>
            <p className="govuk-body">
              You can change these details in your GOV.UK One Login:
            </p>
            <ul className="govuk-body">
              <li>email address</li>
              <li>password</li>
              <li>how you get security codes to sign in</li>
            </ul>
            <p className="govuk-body">
              <a href={oneLoginUrl}>
                Change your sign in details in your GOV.UK One Login
              </a>
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default SignInDetails;
