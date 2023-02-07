import CustomLink from '../../../../../../../components/custom-link/CustomLink';
import InsetText from '../../../../../../../components/inset-text/InsetText';

type UnpublishButtonProps = {
  schemeId: string;
  advertId: string;
};

const UnpublishButton = ({ schemeId, advertId }: UnpublishButtonProps) => {
  return (
    <InsetText>
      <h2 className="govuk-heading-m" data-cy="cy-confirm-unpublish-header">
        Unpublish your advert
      </h2>

      <p className="govuk-body" data-cy="cy-confirm-unpublish-help-text-1">
        To make changes to your advert you need to unpublish it first.
      </p>
      <p className="govuk-body" data-cy="cy-confirm-unpublish-help-text-2">
        Once unpublished your advert will not appear on Find a grant.
      </p>

      <CustomLink
        href={`/scheme/${schemeId}/advert/${advertId}/unpublish-confirmation`}
        isButton
        dataCy="cy-unpublish-advert-button"
      >
        Unpublish this advert
      </CustomLink>
    </InsetText>
  );
};

export default UnpublishButton;
