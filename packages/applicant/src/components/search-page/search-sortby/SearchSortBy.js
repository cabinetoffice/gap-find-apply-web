import gloss from '../../../utils/glossary.json';
import { SelectInput } from '../../input-select/SelectInput';

export function SearchSortBy({ sortBy, handleSortByChange }) {
  const sortByOptions = [
    { field: gloss.browse.sortByOptions.openingDate, value: 'openingDate' },
    { field: gloss.browse.sortByOptions.closingDate, value: 'closingDate' },
    { field: gloss.browse.sortByOptions.maxValue, value: 'maxValue' },
    { field: gloss.browse.sortByOptions.minValue, value: 'minValue' },
  ];

  return (
    <>
      <SelectInput
        label={gloss.browse.sortBy}
        options={sortByOptions}
        onChange={handleSortByChange}
        initialValue={sortBy}
      />

      <noscript>
        <div className="govuk-form-group govuk-gap-form-group govuk-!-margin-bottom-0">
          <label
            className="govuk-label gap_results-tools__label"
            htmlFor="sortBy"
          >
            {gloss.browse.sortBy}
          </label>
          <select
            className="govuk-select"
            id="sortBy"
            data-testid="sortBy"
            name="sortBy"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="openingDate">
              {gloss.browse.sortByOptions.openingDate}
            </option>
            <option value="closingDate">
              {gloss.browse.sortByOptions.closingDate}
            </option>
            <option value="maxValue">
              {gloss.browse.sortByOptions.maxValue}
            </option>
            <option value="minValue">
              {gloss.browse.sortByOptions.minValue}
            </option>
          </select>
        </div>

        <button
          className="govuk-button govuk-button--secondary margin-left-6"
          data-module="govuk-button"
        >
          Apply
        </button>
      </noscript>
    </>
  );
}
