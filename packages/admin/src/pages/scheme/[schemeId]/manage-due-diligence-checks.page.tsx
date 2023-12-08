import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { SpotlightMessage } from '../../../components/notification-banner/SpotlightMessage';
import { hasCompletedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import {
  GetSpotlightSubmissionDataBySchemeIdDto,
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
  const hasInfoToDownload = await hasCompletedMandatoryQuestions(
    schemeId,
    sessionCookie,
    isInternal
  );

  const ggisSchemeRefUrl = `/scheme/edit/ggis-reference?schemeId=${scheme.schemeId}&defaultValue=${scheme.ggisReference}`;

  let spotlightErrors = null;
  let internalDueDiligenceData: GetSpotlightSubmissionDataBySchemeIdDto = {
    sentCount: 0,
    sentLastUpdatedDate: '',
    hasSpotlightSubmissions: false,
  };

  if (isInternal) {
    internalDueDiligenceData = await getSpotlightSubmissionSentData(
      schemeId,
      sessionCookie
    );
    spotlightErrors = await getSpotlightErrors(schemeId, sessionCookie);
  }

  return {
    props: {
      scheme,
      hasInfoToDownload,
      internalDueDiligenceData,
      spotlightUrl,
      isInternal,
      ggisSchemeRefUrl,
      spotlightErrors,
    },
  };
};

const ManageDueDiligenceChecks = ({
  scheme,
  hasInfoToDownload,
  internalDueDiligenceData,
  spotlightUrl,
  isInternal,
  ggisSchemeRefUrl,
  spotlightErrors,
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

          {hasInfoToDownload && (
            <>
              {isInternal ? (
                <InternalApplication
                  spotlightErrors={spotlightErrors!}
                  internalDueDiligenceData={internalDueDiligenceData}
                  spotlightUrl={spotlightUrl}
                  schemeId={scheme.schemeId}
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
