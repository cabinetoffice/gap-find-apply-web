export function SearchFilterInput({ filter, index, filterObj, sublevel }) {
  return (
    <input
      className="govuk-checkboxes__input"
      id={filter.index_name + index}
      name={filter.index_name}
      type="checkbox"
      data-cy={`cy${sublevel.display}Checkbox`}
      defaultChecked={filterObj[filter.index_name]?.values?.some(
        (value) => value.id === sublevel.id
      )}
      value={sublevel.id}
    />
  );
}
