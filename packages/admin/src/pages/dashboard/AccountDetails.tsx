import CustomLink from '../../components/custom-link/CustomLink';
import UserDetails from '../../types/UserDetails';

const AccountDetails = ({ userDetails }: AccountDetailsProps) => {
  return (
    <>
      <div className="govuk-!-margin-bottom-5">
        <div className="govuk-!-margin-bottom-7">
          <h1 className="govuk-heading-l" data-cy="cy_dashboardPageTitle">
            Manage a grant
          </h1>
        </div>
        <h2 className="govuk-heading-m">Your details</h2>
        <dl className="govuk-summary-list govuk-summary-list--no-border">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Email</dt>
            <dd className="govuk-summary-list__value">{`${userDetails.emailAddress}`}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Organisation</dt>
            <dd className="govuk-summary-list__value">
              {userDetails.organisationName}
            </dd>
          </div>
        </dl>
        <p className="govuk-body">
          All of the grants linked to your account are listed below.
        </p>
      </div>
      <CustomLink href="/new-scheme/name" isButton dataCy="cy_addAGrantButton">
        Add a grant
      </CustomLink>
    </>
  );
};

interface AccountDetailsProps {
  userDetails: UserDetails;
}

export default AccountDetails;
