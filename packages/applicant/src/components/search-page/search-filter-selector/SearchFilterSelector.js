import { SearchFilterInput } from '../search-filter-input/SearchFilterInput';

export function SearchFilterSelector({ index, filter, filterObj }) {
  return (
    <div
      key={index}
      className="govuk-accordion__section govuk-accordion__section--expanded"
    >
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading govuk-fieldset__heading">
              <span
                className="govuk-accordion__section-button"
                id={`accordion-default-heading-${index + 1}`}
                data-cy={`cyAccordionButton-${filter.display}`}
              >
                {filter.display}
              </span>
            </h2>
          </div>
        </legend>
        <div
          id={`accordion-default-content-${index + 1}`}
          className="govuk-accordion__section-content"
          data-testid="section-content"
          aria-labelledby={`accordion-default-heading-${index + 1}`}
          role="group"
          data-cy={`cyAccordionContent-${filter.display}`}
        >
          <div
            className="govuk-checkboxes govuk-checkboxes--small"
            data-module="govuk-checkboxes"
          >
            {filter?.sublevel?.map((sublevel, index) => {
              return (
                <div
                  className="govuk-checkboxes__item"
                  data-testid="checkbox-items"
                  key={index}
                >
                  <SearchFilterInput
                    filter={filter}
                    index={index}
                    sublevel={sublevel}
                    filterObj={filterObj}
                  />
                  <label
                    className="govuk-label govuk-checkboxes__label"
                    htmlFor={filter.index_name + index}
                    data-cy={`cy${sublevel.display}Label`}
                  >
                    {sublevel.display}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>
    </div>
  );
}
