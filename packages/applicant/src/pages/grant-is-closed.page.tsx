import Layout from '../components/partials/Layout';
import Meta from '../components/partials/Meta';

export default function GrantIsClosedPage() {
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
                href="https://www.find-government-grants.service.gov.uk/grants"
                role="button"
                draggable="false"
                className="govuk-button"
                data-module="govuk-button"
              >
                Find a grant
              </a>

              <a
                className="govuk-link govuk-link--no-visited-state"
                href="/dashboard"
              >
                Go back
              </a>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
