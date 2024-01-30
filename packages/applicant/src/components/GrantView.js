import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from './partials/Layout';

const GrantView = () => {
  const [pageTitle, setPageTitle] = useState('');
  //
  useEffect(() => {
    setPageTitle('Grant view page');
  }, [pageTitle]);

  return (
    <Layout>
      <div className="govuk-width-container app-width-container">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              ALPHA
            </strong>
            <span className="govuk-phase-banner__text">
              This is a new service – your{' '}
              <Link href="/" className="govuk-link">
                feedback
              </Link>{' '}
              will help us to improve it.
            </span>
          </p>
        </div>

        <Link href="/" className="govuk-back-link">
          Back
        </Link>

        <main
          className="govuk-main-wrapper app-main-class"
          id="main-content"
          role="main"
        >
          <h1 className="govuk-heading-xl">{pageTitle}</h1>

          {/* Grant details */}
          <p>Grant details will be displayed here</p>
        </main>
      </div>
    </Layout>
  );
};

export default GrantView;
