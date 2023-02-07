import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Layout from '../../components/partials/Layout';
import Meta from '../../components/partials/Meta';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const serviceError = JSON.parse(query.serviceErrorProps as string);
  return {
    props: {
      serviceError,
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
                  <Link href={serviceError.linkAttributes.href}>
                    <a className="govuk-link">
                      {serviceError.linkAttributes.linkText}
                    </a>
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
