import { SearchInputBar } from '../search-input-bar/SearchInputBar';

export function SearchBar({ term }) {
  return (
    <div className="govuk-form-group govuk-!-margin-bottom-0 gap-search-area govuk-!-padding-4">
      <form action="/grants" method="GET">
        <div className="govuk-form-group govuk-!-margin-bottom-3">
          <p className="govuk-body">
            Find government grants and check if you are eligible to apply.
          </p>
          <label
            className="govuk-visually-hidden"
            htmlFor="homePageSearchBar"
            data-cy="cySearchDescription"
          >
            Search grants
          </label>
          <SearchInputBar
            dataCy={'cyHomePageSearchInput'}
            id={'homePageSearchBar'}
            searchTerm={term}
          />
        </div>
        <div className="govuk-!-width-full">
          <button
            className="govuk-button govuk-!-margin-bottom-0"
            data-module="govuk-button"
            data-cy="cySearchGrantsBtn"
          >
            Search grants
          </button>
        </div>
      </form>
    </div>
  );
}
