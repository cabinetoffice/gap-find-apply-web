import { SearchInputBar } from '../../search-input-bar/SearchInputBar';

export function SearchForm({ searchTerm, searchHeading }) {
  return (
    <div
      className="govuk-grid-column-two-thirds govuk-form-group govuk-!-margin-bottom-0"
      data-cy="cySearchAgainForm"
    >
      <label
        className="govuk-label govuk-!-font-weight-bold govuk-!-font-size-24 govuk-!-margin-top-2"
        htmlFor="searchAgainTermInput"
        data-cy="cySearchDescription"
      >
        {searchHeading}
      </label>
      <div className="govuk-grid-row">
        <div className="govuk-form-group govuk-grid-column-full">
          <div className="govuk-input__wrapper govuk-search-group">
            <SearchInputBar
              dataCy={'cySearchAgainInput'}
              searchTerm={searchTerm}
              id={'searchAgainTermInput'}
            />
            <button
              className="govuk-button govuk-!-margin-left-2"
              data-module="govuk-button"
              data-cy="cySearchAgainButton"
              htmlFor="searchAgainTermInput"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
