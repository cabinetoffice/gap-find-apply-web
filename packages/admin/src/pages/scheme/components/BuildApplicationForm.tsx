import CustomLink from '../../../components/custom-link/CustomLink';
import Scheme from '../../../types/Scheme';

const BuildApplicationForm = ({ schemeId }: BuildApplicationFormProps) => {
  return (
    <>
      <h2
        className="govuk-heading-m govuk-!-padding-top-4"
        data-cy="cy_view-application-header"
        data-testid="build-application-form-component"
      >
        Grant application form
      </h2>

      <p className="govuk-body">
        Build and publish an application form for your grant.
      </p>

      <CustomLink
        href={`/build-application/name?grantSchemeId=${schemeId}`}
        isButton
        dataCy="cyBuildApplicationForm"
      >
        Build application form
      </CustomLink>
    </>
  );
};

type BuildApplicationFormProps = {
  schemeId: Scheme['schemeId'];
};

export default BuildApplicationForm;
