import { TextInput } from 'gap-web-ui';
import { GetServerSideProps } from 'next';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { initiateCSRFCookie } from '../../utils/csrf';
import { routes } from '../../utils/routes';

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  await initiateCSRFCookie(req, res);
  return { props: { csrfToken: (req as any).csrfToken?.() || '' } };
};

function Login({ csrfToken }: { csrfToken: string }) {
  const errors = [];

  return (
    <>
      <Meta
        title={`${
          errors.length > 0 ? 'Error: ' : ''
        }Register to apply - Apply for a grant`}
      />
      <Layout backBtnUrl={routes.homePage}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <form action="">
              <h1 className="govuk-heading-l">Sign in to apply for a grant</h1>
              <TextInput
                questionTitle="Enter your email address to receive a link"
                fieldName="login-email"
                fieldErrors={errors}
                titleSize="s"
                textInputSubtype="email"
                width="30"
              />
              <input type="hidden" name="_csrf" value={csrfToken} />
              <button className="govuk-button" data-module="govuk-button">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default Login;
