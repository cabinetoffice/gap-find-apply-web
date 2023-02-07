import { useEffect } from 'react';
import { SearchFilterButton } from '../search-apply-filters/SearchFilterButton';
import { SearchFilterClearButton } from '../search-clear-filters/SearchFilterClearButton';
import { SearchFilterSelector } from '../search-filter-selector/SearchFilterSelector';
import { SearchFilterDate } from '../search-filter-date/SearchFilterDate';

export function SearchFilterContainer({ filters, filterObj }) {
  useEffect(() => {
    const $filterAccordion = document.querySelector(
      '[data-module="gap-accordion"]'
    );
    if ($filterAccordion && window.GOVUKFrontend !== undefined) {
      new window.GOVUKFrontend.Accordion($filterAccordion).init();
    }
  }, []);

  return (
    <div className="govuk-grid-column-one-third">
      <div className="gap_filters govuk-!-margin-bottom-2">
        <SearchFilterClearButton
          classname={
            'govuk-button govuk-button--secondary govuk-!-margin-bottom-6'
          }
          dataCy={'cyCancelFilterTop'}
        />

        <div
          className="govuk-accordion"
          data-module="gap-accordion"
          id="accordion-default"
          aria-label="filter options"
        >
          {filters?.map((filter, index) => (
            <SearchFilterSelector
              key={index}
              index={index}
              filter={filter}
              filterObj={filterObj}
            />
          ))}

          <SearchFilterDate index={filters.length} filterObj={filterObj} />
        </div>
      </div>
      <div className="govuk-button-group govuk-!-margin-bottom-0 gap_filters-actions">
        <SearchFilterButton />

        <SearchFilterClearButton
          classname={'govuk-button govuk-button--secondary'}
          dataCy={'cyCancelFilterBottom'}
        />
      </div>
    </div>
  );
}
