import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';
import { normaliseServiceError } from '../../utils/safeHref';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  let parsed: unknown = {};
  try {
    parsed = JSON.parse((query.serviceErrorProps as string) ?? '{}');
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
        title="Service error - Apply for a grant"
        description="Service error - Apply for a grant"
      />
      <Layout>
        <div className="govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h1 className="govuk-heading-l">
                Sorry, there is a problem with the service
              </h1>
              <p className="govuk-body">Try again later.</p>
              <p className="govuk-body">{serviceError.errorInformation}</p>
              {serviceError.linkAttributes && (
                <p className="govuk-body">
                  <Link
                    href={serviceError.linkAttributes.href}
                    className="govuk-link"
                  >
                    {serviceError.linkAttributes.linkText}
                  </Link>{' '}
                  {serviceError.linkAttributes.linkInformation}
                </p>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

interface ServiceErrorProps {
  serviceError: ServiceError;
}

export interface ServiceError {
  errorInformation: string;
  linkAttributes?: LinkAttributes;
}

interface LinkAttributes {
  href: string;
  linkText: string;
  linkInformation: string;
}

export default ServiceErrorPage;
