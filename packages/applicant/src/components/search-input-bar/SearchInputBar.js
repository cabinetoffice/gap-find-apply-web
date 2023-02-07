export function SearchInputBar({ searchTerm, dataCy, id }) {
  return (
    <input
      className="govuk-input"
      id={id}
      name="searchTerm"
      type="text"
      defaultValue={searchTerm}
      placeholder="enter a keyword or search term here"
      data-cy={dataCy}
    />
  );
}
