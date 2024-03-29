import { Button, FlexibleQuestionPageLayout } from 'gap-web-ui';
import { useRef, useState } from 'react';
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
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.submit();
    }
  };
  return (
    <FlexibleQuestionPageLayout
      formAction={resolvedUrl}
      fieldErrors={[]}
      csrfToken={csrfToken}
      formRef={formRef}
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
              ? `Schedule my advert - ${advertName}`
              : `Publish my advert - ${advertName}`
          }
          data-cy="cy-advert-confirm-and-publish"
          disabled={isButtonDisabled}
          onClick={() => {
            setIsButtonDisabled(true);
            handleSubmit();
          }}
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
