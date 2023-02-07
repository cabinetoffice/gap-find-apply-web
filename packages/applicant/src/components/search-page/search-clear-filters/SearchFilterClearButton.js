export function SearchFilterClearButton({ dataCy, classname }) {
  return (
    <button
      className={classname}
      data-module="govuk-button"
      data-cy={dataCy}
      name="clearFilters"
      value="true"
    >
      Clear all filters
    </button>
  );
}
