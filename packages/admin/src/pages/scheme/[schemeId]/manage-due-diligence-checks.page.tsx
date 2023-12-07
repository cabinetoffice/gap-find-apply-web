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
  GetSpotlightSubmissionSentData,
  getSpotlightSubmissionSentData,
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

  const hasSpotlightDataToDownload = await hasSpotlightData(
    schemeId,
    sessionCookie
  );

  const ggisSchemeRefUrl = `/scheme/edit/ggis-reference?schemeId=${scheme.schemeId}&defaultValue=${scheme.ggisReference}`;

  let spotlightErrors;
  let spotlightSubmissionCountAndLastUpdated: GetSpotlightSubmissionSentData = {
    count: 0,
    lastUpdatedDate: '',
  };

  if (isInternal) {
    spotlightSubmissionCountAndLastUpdated =
      await getSpotlightSubmissionSentData(schemeId, sessionCookie);
    spotlightErrors = await getSpotlightErrors(scheme.schemeId, sessionCookie);
  }

  return {
    props: {
      scheme,
      hasInfoToDownload,
      spotlightSubmissionCountAndLastUpdated,
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
  spotlightSubmissionCountAndLastUpdated,
  spotlightUrl,
  isInternal,
  ggisSchemeRefUrl,
  spotlightErrors,
  hasSpotlightDataToDownload,
}: InferProps<typeof getServerSideProps>) => {
  const downloadFullDueDiligenceChecksMessage = isInternal
    ? 'Download checks from applications'
    : 'Download due diligence information';

  const downloadFullDueDiligenceChecksUrl = `/api/manage-due-diligence/v2/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}&internal=${isInternal}`;

  return (
    <>
      <Meta title="Manage due diligence checks - Manage a grant" />

      <CustomLink href={`/scheme/${scheme.schemeId}`} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          {isInternal && spotlightErrors!.errorFound && (
            <SpotlightMessage
              status={spotlightErrors!.errorStatus}
              count={spotlightErrors!.errorCount}
              schemeUrl={ggisSchemeRefUrl}
            />
          )}

          <h1 className="govuk-heading-l">Manage due diligence checks</h1>

          {!hasInfoToDownload && (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          )}

          {hasInfoToDownload && ( // we need to check if the scheme is an internal or not and based on that hasInfoToDownload
            //will check if Internal  that there are mq completed and with sumbmission submitted, or if external if there are mq completed
            <>
              {isInternal ? (
                <InternalApplication
                  spotlightErrors={spotlightErrors!}
                  spotlightSubmissionCountAndLastUpdated={
                    spotlightSubmissionCountAndLastUpdated
                  }
                  spotlightUrl={spotlightUrl}
                  schemeId={scheme.schemeId}
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
                {/* done */}
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
