import Link from '../components/custom-link/CustomLink';
import Meta from '../components/layout/Meta';

const Custom404 = () => {
  return (
    <>
      <Meta
        title="Page not found - Manage a grant"
        description="Page not found - Manage a grant"
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full govuk-!-margin-top-7">
          <h1 className="govuk-heading-l" tabIndex={-1}>
            Page not found
          </h1>
          <p className="govuk-body">
            If you typed the web address, check it is correct.
          </p>
          <p className="govuk-body">
            If you pasted the web address, check you copied the entire address.
          </p>
          <p className="govuk-body">
            To return to the admin dashboard, please visit the{' '}
            <Link href="/dashboard">
              <a className="govuk-link">dashboard</a>
            </Link>{' '}
            page.
          </p>
        </div>
      </div>
    </>
  );
};

export default Custom404;
