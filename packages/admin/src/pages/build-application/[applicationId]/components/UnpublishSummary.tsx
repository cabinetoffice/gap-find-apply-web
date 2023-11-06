import getConfig from 'next/config';
import CustomLink from '../../../../components/custom-link/CustomLink';

const UnpublishSummary = ({
  applicationId,
  grantSchemeId,
  applyToApplicationUrl,
}: UnpublishSummaryProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToApplicantApplicationForm = `${publicRuntimeConfig.APPLICANT_DOMAIN}${applyToApplicationUrl}`;
  const findAGrantLink = (
    <a href={publicRuntimeConfig.FIND_A_GRANT_URL} className="govuk-link">
      Find a grant
    </a>
  );

  return (
    <>
      <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
        Add this application form to your grant advert?
      </h2>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <p className="govuk-body">
            To add this application form to your advert, copy the URL below and
            paste it into the &apos;How to Apply&apos; section of your grant
            advert.
          </p>

          <p className="govuk-body break-all-words">
            <a href={linkToApplicantApplicationForm} className="govuk-link">
              {linkToApplicantApplicationForm}
            </a>
          </p>

          <hr className="govuk-section-break govuk-section-break--l" />

          <h2 className="govuk-heading-s govuk-!-margin-bottom-2">
            Unpublish this application form?
          </h2>

          <p className="govuk-body">
            Once unpublished, your application form will no longer appear on{' '}
            {findAGrantLink} and applications cannot be submitted. You will be
            able to edit the application form and re-publish.
          </p>

          <div className="govuk-button-group">
            <CustomLink
              isButton
              href={`/build-application/${applicationId}/unpublish-confirmation`}
              dataCy="cy_unpublishApplication-button"
            >
              Unpublish
            </CustomLink>

            <CustomLink href={`/scheme/${grantSchemeId}`}>Exit</CustomLink>
          </div>
        </div>
      </div>
    </>
  );
};

type UnpublishSummaryProps = {
  applicationId: string;
  grantSchemeId: string;
  applyToApplicationUrl: string;
};

export default UnpublishSummary;
