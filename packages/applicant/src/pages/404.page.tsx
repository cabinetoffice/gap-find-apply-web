import Link from 'next/link';
import Layout from '../components/partials/Layout';
import Meta from '../components/partials/Meta';

const Custom404 = () => {
  return (
    <>
      <Meta title="Page not found - Apply for a grant" />

      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1
              className="govuk-heading-l"
              id="main-content-focus"
              tabIndex={-1}
            >
              Page not found
            </h1>
            <p className="govuk-body">
              If you typed the web address, check it is correct.
            </p>
            <p className="govuk-body">
              If you pasted the web address, check you copied the entire
              address.
            </p>
            <p className="govuk-body">
              To return to the dashboard, please visit the{' '}
              <Link href="/" className="govuk-link">
                dashboard
              </Link>{' '}
              page.
            </p>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Custom404;
