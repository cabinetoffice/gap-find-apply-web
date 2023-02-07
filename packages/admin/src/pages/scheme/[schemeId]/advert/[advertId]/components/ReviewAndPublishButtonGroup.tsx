import CustomLink from '../../../../../../components/custom-link/CustomLink';

type ReviewAndPublishButtonGroupProps = {
  schemeId: string;
  advertId: string;
  isPublishDisabled: boolean;
};

export const ReviewAndPublishButtonGroup = ({
  schemeId,
  advertId,
  isPublishDisabled,
}: ReviewAndPublishButtonGroupProps) => {
  return (
    <div className="govuk-button-group">
      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/summary`}
        isButton
        disabled={isPublishDisabled}
        dataCy="cy-publish-advert-button"
        aria-label="Review and publish grant advert"
      >
        Review and publish
      </CustomLink>

      <CustomLink
        href={`/scheme/${schemeId}`}
        dataCy="cy-exit"
        ariaLabel="Go back to view Scheme page"
      >
        Exit
      </CustomLink>
    </div>
  );
};
