import CustomLink from '../../../../components/custom-link/CustomLink';
import InsetText from '../../../../components/inset-text/InsetText';
import { GetSpotlightSubmissionSentData } from '../../../../services/SpotlightSubmissionService';
import { SpotlightError } from '../../../../types/SpotlightError';
interface InternalApplicationProps {
  spotlightSubmissionCountAndLastUpdated: GetSpotlightSubmissionSentData;
  spotlightUrl: string;
  hasSpotlightDataToDownload: boolean;
  schemeId: string;
  spotlightErrors: SpotlightError;
}

export const InternalApplication = ({
  spotlightSubmissionCountAndLastUpdated,
  spotlightUrl,
  hasSpotlightDataToDownload,
  schemeId,
  spotlightErrors,
}: InternalApplicationProps) => {
  const { count, lastUpdatedDate } = spotlightSubmissionCountAndLastUpdated;
  //checks if the mandatory question submission is submitted
  return (
    <div>
      <p className="govuk-body">
        Your application form has been designed to capture all of the
        information you need to run due diligence checks in Spotlight, a
        government owned due diligence tool.
      </p>
      <p className="govuk-body">
        We automatically send the information to Spotlight. You need to log in
        to Spotlight to run your checks.
      </p>
      <p className="govuk-body">
        Spotlight does not run checks on individuals or local authorities.
      </p>
      <InsetText>
        <p className="govuk-!-margin-bottom-0" data-testid="spotlight-count">
          You have{' '}
          <span className="govuk-!-font-weight-bold">
            {count} application
            {count !== 1 && 's'}
          </span>{' '}
          in Spotlight.
        </p>
        <p
          className="govuk-!-margin-top-0"
          data-testid="spotlight-last-updated"
        >
          {lastUpdatedDate == '' ? (
            <>No records have been sent to Spotlight. </>
          ) : (
            <>
              Spotlight was last updated on{' '}
              <span className="govuk-!-font-weight-bold">
                {lastUpdatedDate}
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
            href={`/api/manage-due-diligence/v2/internal/downloadSpotlightChecks?schemeId=${schemeId}`}
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
              href={`/api/manage-due-diligence/v2/internal/downloadSpotlightValidationErrorSubmissions?schemeId=${schemeId}`}
            >
              download checks that Find a grant cannot send to Spotlight
            </CustomLink>{' '}
          </p>
        )}
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible"></hr>
    </div>
  );
};
