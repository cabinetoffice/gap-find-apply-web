import gloss from '../../../../utils/glossary.json';

export function GrantDetailsTabItem({ tab, index }) {
  return (
    <li
      className={
        'govuk-tabs__list-item' +
        (index === 0 ? ' govuk-tabs__list-item--selected' : '')
      }
    >
      <a className="govuk-tabs__tab" href={`#${tab}`} data-cy={`cyTabs_${tab}`}>
        {gloss.grantDetails.tabs[tab]}
      </a>
    </li>
  );
}
