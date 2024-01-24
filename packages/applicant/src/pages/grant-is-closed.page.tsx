import getConfig from 'next/config';
import Layout from '../components/partials/Layout';
import Meta from '../components/partials/Meta';

export default function GrantIsClosedPage() {
  const { publicRuntimeConfig } = getConfig();
  return (
    <>
      <Meta title="Grant is closed - Apply for a grant" />

      <Layout>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-l">This grant is closed</h1>
            <p className="govuk-body">
              The closing date for applications has passed. You cannot create or
              submit an application for this grant.
            </p>
            <div className="govuk-button-group">
              <a
                href={publicRuntimeConfig.FIND_A_GRANT_URL + '/grants'}
                role="button"
                draggable="false"
                className="govuk-button"
                data-module="govuk-button"
              >
                Find a grant
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
