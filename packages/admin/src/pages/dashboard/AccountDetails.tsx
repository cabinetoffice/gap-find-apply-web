import UserDetails from '../../types/UserDetails';

const AccountDetails = ({ userDetails }: AccountDetailsProps) => {
  return (
    <div className="govuk-!-margin-bottom-9">
      <div className="govuk-!-margin-bottom-7">
        <h1 className="govuk-heading-l" data-cy="cy_dashboardPageTitle">
          Manage a grant
        </h1>
        <p className="govuk-body">
          Use this service to add your grant details and build an application
          form for applicants to use.
        </p>
      </div>
      <h2 className="govuk-heading-m">Your details</h2>
      <dl className="govuk-summary-list govuk-summary-list--no-border">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Admin Name</dt>
          <dd className="govuk-summary-list__value">{`${userDetails.firstName} ${userDetails.lastName}`}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Organisation</dt>
          <dd className="govuk-summary-list__value">
            {userDetails.organisationName}
          </dd>
        </div>
      </dl>
    </div>
  );
};

interface AccountDetailsProps {
  userDetails: UserDetails;
}

export default AccountDetails;
