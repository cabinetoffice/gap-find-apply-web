import { DateField } from '../../date-field/DateField';
import SpecificErrorMessage from '../../displayErrors/specificMessageError/SpecificErrorMessage';

type SearchFilterDateProps = {
  index: number;
  filterObj?: any;
};

export const SearchFilterDate = ({
  index,
  filterObj,
}: SearchFilterDateProps) => {
  return (
    <div
      key={index}
      className="govuk-accordion__section govuk-accordion__section--expanded"
      data-testid="date-range-accordion-section"
      id="datepicker"
    >
      <fieldset className="govuk-fieldset date-filter-error">
        <legend className="govuk-fieldset__legend">
          <div className="govuk-accordion__section-header">
            <h2 className="govuk-accordion__section-heading govuk-fieldset__heading">
              <span
                id={`accordion-default-heading-${index + 1}`}
                className="govuk-accordion__section-button"
              >
                Date added
              </span>
            </h2>
          </div>
        </legend>
        {filterObj?.errors?.length > 0 && (
          <SpecificErrorMessage
            errors={filterObj?.errors}
            errorType={'datepicker'}
          />
        )}

        <div
          id={`accordion-default-content-${index + 1}`}
          className={`govuk-accordion__section-content ${
            filterObj?.errors?.length > 0 ? 'govuk-form-group--error' : ''
          }`}
          data-testid="section-content"
          role="group"
          aria-labelledby={`accordion-default-heading-${index + 1}`}
        >
          <div className="govuk-!-display-block">
            <DateField
              hint="From"
              fieldName="from"
              values={filterObj?.dateRange?.values[0]?.from}
              datePicker={true}
              error={filterObj?.dateRange?.values[0]?.from.error}
            />

            <DateField
              hint="To"
              fieldName="to"
              values={filterObj?.dateRange?.values[0]?.to}
              datePicker={true}
              error={filterObj?.dateRange?.values[0]?.to.error}
            />

            <button
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              name="clearDateFilters"
              value="true"
            >
              Clear date
            </button>
          </div>
        </div>
      </fieldset>
    </div>
  );
};
