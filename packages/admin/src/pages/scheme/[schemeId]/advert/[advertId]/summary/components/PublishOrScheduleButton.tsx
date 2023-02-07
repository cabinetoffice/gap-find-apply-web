import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import CustomLink from '../../../../../../../components/custom-link/CustomLink';

type PublishOrScheduleButtonProps = {
  resolvedUrl: string;
  csrfToken: string;
  futurePublishingDate: boolean;
  schemeId: string;
  advertId: string;
  advertName: string;
};

const PublishOrScheduleButton = ({
  resolvedUrl,
  csrfToken,
  futurePublishingDate,
  schemeId,
  advertId,
  advertName,
}: PublishOrScheduleButtonProps) => {
  return (
    <FlexibleQuestionPageLayout
      formAction={resolvedUrl}
      fieldErrors={[]}
      csrfToken={csrfToken}
    >
      {futurePublishingDate ? (
        <div
          data-cy="cy-advert-summary-footer-text"
          className="govuk-inset-text"
        >
          <p>
            Your advert will be published automatically on the opening date.
          </p>
          <p>It will be unpublished automatically on the closing date.</p>
        </div>
      ) : (
        <div
          data-cy="cy-advert-summary-footer-text"
          className="govuk-inset-text"
        >
          Once published the advert will appear on Find a grant straight away.
        </div>
      )}

      <div className="govuk-button-group">
        <Button
          text={
            futurePublishingDate ? 'Schedule my advert' : 'Confirm and publish'
          }
          ariaLabel={
            futurePublishingDate
              ? `Schedule ${advertName} grant advert`
              : `Publish ${advertName} grant advert`
          }
          data-cy="cy-advert-confirm-and-publish"
        />

        <CustomLink
          href={`/scheme/${schemeId}/advert/${advertId}/section-overview`}
          dataCy="cy-cancel-button"
          ariaLabel="Cancel"
        >
          Cancel
        </CustomLink>
      </div>
    </FlexibleQuestionPageLayout>
  );
};

export default PublishOrScheduleButton;
