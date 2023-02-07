import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './partials/Layout';

const HomeView = () => {
  const [pageTitle, setPageTitle] = useState('');
  //
  useEffect(() => {
    setPageTitle('Find a grant');
  }, [pageTitle]);

  return (
    <Layout>
      <div className="govuk-width-container app-width-container">
        <div className="govuk-phase-banner">
          <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">
              alpha
            </strong>
            <span className="govuk-phase-banner__text">
              This is a new service – your{' '}
              <Link className="govuk-link" to="/">
                feedback
              </Link>{' '}
              will help us to improve it.
            </span>
          </p>
        </div>

        {/*<Link to="/" className="govuk-back-link">Back</Link>*/}

        <main
          className="govuk-main-wrapper app-main-class"
          id="main-content"
          role="main"
        >
          <h1 className="govuk-heading-xl">{pageTitle}</h1>

          {/* Fetch grants from dB */}
          <button className="govuk-button" data-module="govuk-button">
            Fetch grants
          </button>
        </main>
      </div>
    </Layout>
  );
};

export default HomeView;
