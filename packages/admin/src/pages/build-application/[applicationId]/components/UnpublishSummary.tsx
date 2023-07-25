import getConfig from 'next/config';
import CustomLink from '../../../../components/custom-link/CustomLink';

const UnpublishSummary = ({
  applicationId,
  grantSchemeId,
}: UnpublishSummaryProps) => {
  const { publicRuntimeConfig } = getConfig();
  const linkToApplicantApplicationForm = `${publicRuntimeConfig.APPLICANT_DOMAIN}/applications/${applicationId}`;
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

      <p className="govuk-body break-all-words">
        To add this application form to your grant advert, you will need to copy
        and paste the URL below and send it in an email to{' '}
        <a className="govuk-link" href="mailto:findagrant@cabinetoffice.gov.uk">
          findagrant@cabinetoffice.gov.uk
        </a>
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
        {findAGrantLink}. You will be able to edit the application form and
        re-publish.
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
    </>
  );
};

type UnpublishSummaryProps = {
  applicationId: string;
  grantSchemeId: string;
};

export default UnpublishSummary;
