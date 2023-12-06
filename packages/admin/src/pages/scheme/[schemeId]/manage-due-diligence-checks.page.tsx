import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { SpotlightMessage } from '../../../components/notification-banner/SpotlightMessage';
import {
  completedMandatoryQuestions,
  hasSpotlightData,
} from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import {
  getSpotlightLastUpdateDate,
  getSpotlightSubmissionCount,
} from '../../../services/SpotlightSubmissionService';
import InferProps from '../../../types/InferProps';
import { getSessionIdFromCookies } from '../../../utils/session';
import { InternalApplication } from './components/InternalApplication';
import { ExternalApplication } from './components/ExternalApplication';
import { getSpotlightErrors } from '../../../services/SpotlightBatchService';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;

  const sessionCookie = getSessionIdFromCookies(req);
  const scheme = await getGrantScheme(schemeId, sessionCookie);
  const isInternal = await schemeApplicationIsInternal(schemeId, sessionCookie);
  const spotlightUrl = process.env.SPOTLIGHT_URL;
  const hasInfoToDownload = await completedMandatoryQuestions(
    schemeId,
    sessionCookie
  );
  console.log('hasInfoToDownload', hasInfoToDownload);

  const hasSpotlightDataToDownload = await hasSpotlightData(
    schemeId,
    sessionCookie
  );
  console.log('hasSpotlightDataToDownload', hasSpotlightDataToDownload);

  const ggisSchemeRefUrl = `/scheme/edit/ggis-reference?schemeId=${scheme.schemeId}&defaultValue=${scheme.ggisReference}`;

  const spotlightErrors = await getSpotlightErrors(
    scheme.schemeId,
    sessionCookie
  );

  let spotlightSubmissionCount = 0;
  let spotlightLastUpdated = null;
  if (isInternal) {
    spotlightSubmissionCount = await getSpotlightSubmissionCount(
      schemeId,
      sessionCookie
    );
    spotlightLastUpdated = await getSpotlightLastUpdateDate(
      schemeId,
      sessionCookie
    );
  }

  return {
    props: {
      scheme,
      hasInfoToDownload,
      spotlightSubmissionCount,
      spotlightLastUpdated,
      spotlightUrl,
      isInternal,
      ggisSchemeRefUrl,
      spotlightErrors,
      hasSpotlightDataToDownload,
    },
  };
};

const ManageDueDiligenceChecks = ({
  scheme,
  hasInfoToDownload,
  spotlightSubmissionCount,
  spotlightLastUpdated,
  spotlightUrl,
  isInternal,
  ggisSchemeRefUrl,
  spotlightErrors,
  hasSpotlightDataToDownload,
}: InferProps<typeof getServerSideProps>) => {
  const downloadFullDueDiligenceChecksMessage = isInternal
    ? 'Download checks from applications'
    : 'Download due diligence information';
  const downloadFullDueDiligenceChecksUrl = `/api/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}&internal=${isInternal}`;

  return (
    <>
      <Meta title="Manage due diligence checks - Manage a grant" />

      <CustomLink href={`/scheme/${scheme.schemeId}`} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          {spotlightErrors.errorFound && (
            <SpotlightMessage
              status={spotlightErrors.errorStatus}
              count={spotlightErrors.errorCount}
              schemeUrl={ggisSchemeRefUrl}
            />
          )}

          <h1 className="govuk-heading-l">Manage due diligence checks</h1>

          {!hasInfoToDownload && (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          )}

          {hasInfoToDownload && (
            <>
              {isInternal ? (
                <InternalApplication
                  spotlightErrors={spotlightErrors}
                  spotlightLastUpdated={spotlightLastUpdated}
                  spotlightSubmissionCount={spotlightSubmissionCount}
                  spotlightUrl={spotlightUrl}
                  scheme={scheme}
                  hasSpotlightDataToDownload={hasSpotlightDataToDownload}
                />
              ) : (
                <ExternalApplication />
              )}
              <p className="govuk-body">
                If you do not use Spotlight, you can download all of the due
                diligence information to run checks in another service.
              </p>
              <p className="govuk-body">
                <CustomLink href={downloadFullDueDiligenceChecksUrl}>
                  {downloadFullDueDiligenceChecksMessage}
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
