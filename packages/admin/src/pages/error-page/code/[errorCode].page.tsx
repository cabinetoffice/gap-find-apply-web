import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import InferProps from '../../../types/InferProps';
import { generateErrorMessageFromStatusCode } from '../../../utils/serviceErrorHelpers';

export const getServerSideProps = async ({
  query,
  params,
}: GetServerSidePropsContext) => {
  const { errorCode } = params as Record<string, string>;
  const { href } = query as Record<string, string>;
  const errorMessage = generateErrorMessageFromStatusCode(errorCode);
  return {
    props: {
      errorMessage,
      href,
    },
  };
};

const AdvertErrorPage = ({
  errorMessage,
  href,
}: InferProps<typeof getServerSideProps>) => {
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
              {errorMessage && <p className="govuk-body">{errorMessage}</p>}
              {href && (
                <p className="govuk-body">
                  <CustomLink href={href}>Please return</CustomLink> and try
                  again.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AdvertErrorPage;
