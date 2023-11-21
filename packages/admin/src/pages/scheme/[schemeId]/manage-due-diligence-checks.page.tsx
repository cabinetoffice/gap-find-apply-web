import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import InferProps from '../../../types/InferProps';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;

  const sessionCookie = getSessionIdFromCookies(req);
  const scheme = await getGrantScheme(schemeId, sessionCookie);
  const isInternal = await schemeApplicationIsInternal(schemeId, sessionCookie);
  const spotlightUrl = process.env.SPOTLIGHT_LOGIN_URL;
  const hasInfoToDownload = await completedMandatoryQuestions(
    scheme.schemeId,
    sessionCookie
  );

  return {
    props: {
      scheme,
      hasInfoToDownload,
      spotlightUrl,
      isInternal,
    },
  };
};

const ManageDueDiligenceChecks = ({
  scheme,
  hasInfoToDownload,
  spotlightUrl,
  isInternal,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Manage due diligence checks - Manage a grant" />

      <CustomLink href={`/scheme/${scheme.schemeId}`} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <div
            className="govuk-notification-banner"
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
          >
            <div className="govuk-notification-banner__header">
              <h2
                className="govuk-notification-banner__title"
                id="govuk-notification-banner-title"
              >
                Important
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                We can&apos;t send your data to Spotlight
              </p>
              <p className="govuk-body">
                Some of your data cannot be automatically sent to Spotlight.
                This affects {} of your records. You can still download this
                data to manually upload it to Spotlight.
              </p>
              <p className="govuk-body">
                If you need further support, contact our support team at{' '}
                <a
                  className="govuk-notification-banner__link"
                  href="mailto:findagrant@cabinetoffice.gov.uk"
                >
                  findagrant@cabinetoffice.gov.uk
                </a>
              </p>
            </div>
          </div>

          <h1 className="govuk-heading-l">Manage due diligence checks</h1>

          {!hasInfoToDownload ? (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          ) : (
            <>
              {!isInternal ? (
                <div>
                  <p className="govuk-body">
                    We gather the information you need to run due diligence
                    checks.
                  </p>

                  <p className="govuk-body">
                    You can use the government-owned due diligence tool
                    ‘Spotlight’ to run your due diligence checks. The
                    information is already in the correct format to upload
                    directly into Spotlight.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="govuk-body">
                    Your application form has been designed to capture all of
                    the information you need to run due diligence checks in
                    Spotlight, a government owned due diligence tool.
                  </p>

                  <p className="govuk-body">
                    We automatically send the information to Spotlight. You need
                    to log in to Spotlight to run your checks.
                  </p>

                  <p className="govuk-body">
                    Spotlight does not run checks on individuals or local
                    authorities.
                  </p>
                </div>
              )}

              <a href={spotlightUrl} className="govuk-button">
                Log in to Spotlight
              </a>
              {
                //TODO: Add logic to download information
              }
              <p className="govuk-body">
                You can download the information you need to run checks to
                upload it to Spotlight manually.
              </p>
              <p className="govuk-body">
                You can also download checks that Find a grant cannot send to
                Spotlight
              </p>

              <p className="govuk-body">
                <CustomLink
                  href={`/api/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}`}
                >
                  Download due diligence information
                </CustomLink>
              </p>
            </>
          )}

          <CustomLink href={`/scheme/${scheme.schemeId}`} isSecondaryButton>
            Back to grant summary
          </CustomLink>
        </div>
      </div>
    </>
  );
};

export default ManageDueDiligenceChecks;
