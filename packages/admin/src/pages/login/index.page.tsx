import Meta from '../../components/layout/Meta';

function Login() {
  return (
    <div className="govuk-grid-row govuk-!-padding-top-7">
      <Meta title="Login - Manage a grant" />
      <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
        <h1 className="govuk-heading-l">Manage a grant</h1>
        <p className="govuk-body">
          Use this service to build an application form and see who has applied
          for your grant.
        </p>
        <p className="govuk-body">If you have an account, you can sign in.</p>
        <a
          href="https://auth-testing.cabinetoffice.gov.uk/v2/gap/login"
          role="button"
          draggable="false"
          className="govuk-button"
          data-module="govuk-button"
          data-cy="cy-sign-in-admin-button"
        >
          Sign in
        </a>
      </div>
    </div>
  );
}

export default Login;
