import Link from 'next/link';

export function GrantDetailsSidebar({ grantLabel }) {
  return (
    <div className="govuk-grid-column-one-quarter">
      <hr className="govuk-section-break govuk-section-break--visible govuk-!-margin-bottom-2 govuk-border-colour"></hr>
      <h2 className="govuk-heading-m">Get updates about this grant</h2>
      <Link
        href={{
          pathname: '/subscriptions/signup',
          query: { id: grantLabel },
        }}
      >
        <a className="govuk-link" data-cy="cySignupUpdatesLink">
          Sign up for updates
        </a>
      </Link>
    </div>
  );
}
