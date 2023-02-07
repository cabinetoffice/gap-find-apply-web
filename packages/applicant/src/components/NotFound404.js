import React, { useState, useEffect } from 'react';
import Layout from './partials/Layout';
import { Link } from 'react-router-dom';

const NotFound404 = () => {
  const [pageTitle, setPageTitle] = useState('');
  useEffect(() => {
    // database.ref('zhomePage').on('value', snapshot => { if (snapshot.val() !== null) { setHomeObjects({ ...snapshot.val() }); } });
    setPageTitle('Page not found');
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

        <Link to="/" className="govuk-back-link">
          Back
        </Link>

        <main
          className="govuk-main-wrapper app-main-class"
          id="main-content"
          role="main"
        >
          <h1 className="govuk-heading-xl">{pageTitle}</h1>
          <p>
            The page resource you are looking for is either not available or you
            do not have access to it.
          </p>
        </main>
      </div>
    </Layout>
  );
};

export default NotFound404;
