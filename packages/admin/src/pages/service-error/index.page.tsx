import { GetServerSideProps } from 'next';
import CustomLink from '../../components/custom-link/CustomLink';
import Meta from '../../components/layout/Meta';
import ServiceError from '../../types/ServiceError';

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const serviceError = JSON.parse(
    decodeURIComponent(query.serviceErrorProps as string)
  );
  const excludeSubPath = query.excludeSubPath === 'true';

  console.log({serviceError})

  if (serviceError?.linkAttributes?.href === undefined)
    serviceError.linkAttributes.href = '/dashboard';

  return {
    props: {
      serviceError,
      excludeSubPath,
    },
  };
};

const ServiceErrorPage = ({
  serviceError,
  excludeSubPath,
}: ServiceErrorProps) => {
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
                <p className="govuk-body">
                  <CustomLink
                    href={serviceError.linkAttributes.href}
                    excludeSubPath={excludeSubPath}
                  >
                    {serviceError.linkAttributes.linkText}
                  </CustomLink>
                  {serviceError.linkAttributes.linkInformation}
                </p>
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
  excludeSubPath: boolean;
}

export default ServiceErrorPage;
