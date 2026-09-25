import { GetServerSideProps } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import ServiceError from '../../types/ServiceError';
import { normaliseServiceError } from '../../utils/safeHref';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  let parsed: unknown = {};
  try {
    parsed = JSON.parse(
      decodeURIComponent((query.serviceErrorProps as string) ?? '{}')
    );
  } catch {
    // Malformed serviceErrorProps must not 500 the error page itself;
    // fall through to a default, link-less error message.
  }

  return {
    props: {
      serviceError: normaliseServiceError(parsed),
    },
  };
};

const ServiceErrorPage = ({ serviceError }: ServiceErrorProps) => {
  return (
    <>
      <Meta
        title="Service error - Manage a grant"
        description="Service error - Manage a grant"
      />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-main-wrapper--l" role="main">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">
                Sorry, there is a problem with the service
              </h1>
              <p className="govuk-body">Try again later.</p>
              <p className="govuk-body">{serviceError.errorInformation}</p>
              {serviceError.linkAttributes && (
                <>
                  <p className="govuk-body">
                    <CustomLink href={serviceError.linkAttributes.href}>
                      {serviceError.linkAttributes.linkText}
                    </CustomLink>
                  </p>
                  <p className="govuk-body">
                    {serviceError.linkAttributes.linkInformation}
                  </p>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

interface ServiceErrorProps {
  serviceError: ServiceError;
}

export default ServiceErrorPage;
