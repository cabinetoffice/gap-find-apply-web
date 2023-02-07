import CustomLink from '../../../../../../components/custom-link/CustomLink';

type NoJSAssistedJourneyMessageProps = {
  backButtonHref: string;
};

export const NoJSAssistedJourneyMessage = ({
  backButtonHref,
}: NoJSAssistedJourneyMessageProps) => {
  return (
    <noscript>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-l">
            Contact us to create an advert for your grant
          </h1>

          <p className="govuk-body">
            We need to check your internet browser settings before you can
            create an advert for your grant.
          </p>

          <p className="govuk-body">
            You can contact us at{' '}
            <a href="mailto:findagrant@cabinetoffice.gov.uk">
              findagrant@cabinetoffice.gov.uk
            </a>
          </p>

          <CustomLink
            href={backButtonHref}
            isButton
            dataCy="back-to-my-account-button"
          >
            Back to my account
          </CustomLink>
        </div>
      </div>
    </noscript>
  );
};
