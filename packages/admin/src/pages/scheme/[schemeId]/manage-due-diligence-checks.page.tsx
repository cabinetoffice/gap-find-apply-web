import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../components/custom-link/CustomLink';
import InsetText from '../../../components/inset-text/InsetText';
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
  getSpotlightErrors,
  getSpotlightLastUpdateDate,
  getSpotlightSubmissionCount,
} from '../../../services/SpotlightSubmissionService';
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

          {!hasInfoToDownload ? (
            <p className="govuk-body">
              No due diligence information available to download.
            </p>
          ) : (
            <>
              {!isInternal ? (
                <div>
                  <p className="govuk-body">
                    Data is gathered from applicants before they are sent to
                    your application form.
                  </p>
                  <p className="govuk-body">
                    You may wish to use this data to run due diligence checks.
                  </p>

                  <p className="govuk-body">
                    The data includes: <br />
                    <ul>
                      <li>name of organisation</li>
                      <li>address of organisation</li>
                      <li>Companies House number (if they have one)</li>
                      <li>Charity Commission number (if they have one)</li>
                      <li>how much funding an applicant is applying for</li>
                    </ul>
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
                  <InsetText>
                    <p
                      className="govuk-!-margin-bottom-0"
                      data-testid="spotlight-count"
                    >
                      You have{' '}
                      <span className="govuk-!-font-weight-bold">
                        {spotlightSubmissionCount} application
                        {spotlightSubmissionCount !== 1 && 's'}
                      </span>{' '}
                      in Spotlight.
                    </p>
                    <p
                      className="govuk-!-margin-top-0"
                      data-testid="spotlight-last-updated"
                    >
                      {spotlightLastUpdated == '' ? (
                        <>No records have been sent to Spotlight. </>
                      ) : (
                        <>
                          Spotlight was last updated on{' '}
                          <span className="govuk-!-font-weight-bold">
                            {spotlightLastUpdated}
                          </span>
                          .{' '}
                        </>
                      )}
                    </p>
                  </InsetText>
                  <a href={spotlightUrl} className="govuk-button">
                    Log in to Spotlight
                  </a>
                  {hasSpotlightDataToDownload && (
                    <p className="govuk-body">
                      You can{' '}
                      <CustomLink
                        href={`/api/downloadSpotlightChecks?schemeId=${scheme.schemeId}`}
                      >
                        download the information you need to run checks
                      </CustomLink>{' '}
                      to upload it to Spotlight manually.
                    </p>
                  )}
                  {spotlightErrors.errorFound &&
                    spotlightErrors.errorStatus === 'VALIDATION' && (
                      <p className="govuk-body">
                        You can also{' '}
                        <CustomLink
                          href={`/api/downloadSpotlightValidationErrorSubmissions?schemeId=${scheme.schemeId}`}
                        >
                          download checks that Find a grant cannot send to
                          Spotlight
                        </CustomLink>{' '}
                      </p>
                    )}
                  <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"></hr>
                </div>
              )}

              <p className="govuk-body">
                If you do not use Spotlight, you can download all of the due
                diligence information to run checks in another service.
              </p>
              <p className="govuk-body">
                {isInternal ? (
                  <CustomLink
                    href={`/api/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}`}
                  >
                    Download checks from applications
                  </CustomLink>
                ) : (
                  <CustomLink
                    href={`/api/downloadDueDiligenceChecks?schemeId=${scheme.schemeId}`}
                  >
                    Download due diligence information
                  </CustomLink>
                )}
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