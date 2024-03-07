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
            <dt className="govuk-summary-list__key" id="email">
              Email
            </dt>
            <dd className="govuk-summary-list__value" aria-labelledby="email">
              {userDetails.emailAddress}
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key" id="organisation-name">
              Organisation
            </dt>
            <dd
              className="govuk-summary-list__value"
              aria-labelledby="organisation-name"
            >
              {userDetails.organisationName}
            </dd>
          </div>
        </dl>
      </div>
    </>
  );
};

interface AccountDetailsProps {
  userDetails: UserDetails;
}

export default AccountDetails;
