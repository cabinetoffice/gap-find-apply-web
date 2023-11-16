import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import InsetText from '../../../components/inset-text/InsetText';
import Meta from '../../../components/layout/Meta';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import { getGrantScheme } from '../../../services/SchemeService';
import {
  getSpotlightLastUpdateDate,
  getSpotlightSubmissionCount,
} from '../../../services/SpotlightSubmissionService';
import InferProps from '../../../types/InferProps';
import { getSessionIdFromCookies } from '../../../utils/session';

export const getServerSideProps = async ({
  params,
  req,
  query,
}: GetServerSidePropsContext) => {
  const { schemeId } = params as Record<string, string>;
  const { isInternal } = query as Record<string, string>;

  const sessionCookie = getSessionIdFromCookies(req);
  const scheme = await getGrantScheme(schemeId, sessionCookie);
  const hasInfoToDownload = await completedMandatoryQuestions(
    scheme.schemeId,
    sessionCookie
  );

  let spotlightSubmissionCount = 0;
  let spotlightLastUpdated = null;
  if (isInternal == 'true') {
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
      isInternal,
    },
  };
};

const ManageDueDiligenceChecks = ({
  scheme,
  hasInfoToDownload,
  spotlightSubmissionCount,
  spotlightLastUpdated,
  isInternal,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Manage due diligence checks - Manage a grant" />

      <CustomLink href={`/scheme/${scheme.schemeId}`} isBackButton />

      <div className="govuk-grid-row govuk-!-padding-top-7">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-bottom-6">
          <h1 className="govuk-heading-l">Manage due diligence checks</h1>

          {!hasInfoToDownload ? (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          ) : (
            <>
              {isInternal && (
                <InsetText>
                  <p
                    className="govuk-!-margin-bottom-0"
                    data-testid="spotlight-count"
                  >
                    You have{' '}
                    <span className="govuk-!-font-weight-bold">
                      {spotlightSubmissionCount} applications
                    </span>{' '}
                    in Spotlight.
                  </p>
                  <p
                    className="govuk-!-margin-top-0"
                    data-testid="spotlight-last-updated"
                  >
                    {spotlightLastUpdated ? (
                      <>
                        Spotlight was last updated on{' '}
                        <span className="govuk-!-font-weight-bold">
                          {spotlightLastUpdated}
                        </span>
                        .{' '}
                      </>
                    ) : (
                      <>No records have been sent to Spotlight. </>
                    )}
                  </p>
                </InsetText>
              )}
              <p className="govuk-body">
                We gather the information you need to run due diligence checks.
              </p>

              <p className="govuk-body">
                You can use the government-owned due diligence tool ‘Spotlight’
                to run your due diligence checks. The information is already in
                the correct format to upload directly into Spotlight.
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
