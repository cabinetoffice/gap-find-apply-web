import CustomLink from '../../../../components/custom-link/CustomLink';

const PublishButton = ({
  applicationId,
  grantSchemeId,
  disabled,
}: PublishButtonProps) => {
  return (
    <>
      <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
        Have you finished building your application form?
      </h2>
      <p className="govuk-body">
        If you have finished building your application form, you can publish it.
      </p>

      <div className="govuk-button-group">
        <CustomLink
          isButton
          href={`/build-application/${applicationId}/publish-confirmation`}
          disabled={disabled}
          dataCy="cy_publishApplication-button"
        >
          Publish
        </CustomLink>

        <CustomLink href={`/scheme/${grantSchemeId}`}>Exit</CustomLink>
      </div>
    </>
  );
};

type PublishButtonProps = {
  applicationId: string;
  grantSchemeId: string;
  disabled: boolean;
};

export default PublishButton;
