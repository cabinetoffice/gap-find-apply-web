import gloss from '../../../../utils/glossary.json';

export function GrantDetailsTabContent({ children, tab, index }) {
  return (
    <div
      data-cy={`cyTabsContent_${tab}`}
      data-testid="tab-container"
      className={
        'govuk-tabs__panel' + (index > 0 ? ' govuk-tabs__panel--hidden' : '')
      }
      id={tab}
      key={tab}
    >
      <h2 className="govuk-heading">{gloss.grantDetails.tabs[tab]}</h2>
      {children}
    </div>
  );
}
