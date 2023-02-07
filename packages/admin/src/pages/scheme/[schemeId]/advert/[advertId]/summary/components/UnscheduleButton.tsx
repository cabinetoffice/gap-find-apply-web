import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import InsetText from '../../../../../../../components/inset-text/InsetText';

type UnscheduleButtonProps = {
  schemeId: string;
  advertId: string;
};

const UnscheduleButton = ({ schemeId, advertId }: UnscheduleButtonProps) => {
  return (
    <InsetText>
      <h2 className="govuk-heading-m" data-cy="cy-confirm-unschedule-header">
        This advert is scheduled
      </h2>

      <p className="govuk-body" data-cy="cy-confirm-unschedule-help-text-1">
        Your advert will be added to Find a grant automatically on the opening
        date.
      </p>
      <p className="govuk-body" data-cy="cy-confirm-unschedule-help-text-2">
        If you need to, you can make changes to your advert.
      </p>

      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/unschedule-confirmation`}
        isButton
        dataCy="cy-unschedule-advert-button"
      >
        Make changes to my advert
      </CustomLink>
    </InsetText>
  );
};

export default UnscheduleButton;
