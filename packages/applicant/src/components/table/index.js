function Table({
  caption,
  captionClassName,
  className,
  firstCellIsHeader,
  head,
  rows,
  ...attributes
}) {
  let captionComponent;
  let headComponent;
  if (caption) {
    captionComponent = (
      <caption className={`govuk-table__caption ${captionClassName || ''}`}>
        {caption}
      </caption>
    );
  }

  if (head) {
    headComponent = (
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {head.map((item, index) => {
            const {
              className: itemClassName,
              format: itemFormat,
              children: itemChildren,
              ...itemAttributes
            } = item;

            return (
              <th
                key={index}
                scope="col"
                className={`govuk-table__header ${
                  itemFormat ? `govuk-table__header--${itemFormat}` : ''
                } ${itemClassName || ''}`}
                {...itemAttributes}
              >
                {itemChildren}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  const filteredRows = rows ? rows.filter((row) => row.cells) : [];

  return (
    <table className={`govuk-table ${className || ''}`} {...attributes}>
      {captionComponent}
      {headComponent}

      <tbody className="govuk-table__body">
        {filteredRows.map((row, rowIndex) => (
          <tr key={rowIndex} className="govuk-table__row">
            {row.cells.map((cell, cellIndex) => {
              const {
                className: cellClassName,
                children: cellChildren,
                format: cellFormat,
                ...cellAttributes
              } = cell;

              if (cellIndex === 0 && firstCellIsHeader) {
                return (
                  <th
                    key={cellIndex}
                    scope="row"
                    className={`govuk-table__header ${cellClassName || ''}`}
                    {...cellAttributes}
                  >
                    {cellChildren}
                  </th>
                );
              }
              return (
                <td
                  key={cellIndex}
                  className={`govuk-table__cell ${cellClassName || ''} ${
                    cellFormat ? `govuk-table__cell--${cellFormat}` : ''
                  }`}
                  {...cellAttributes}
                >
                  {cellChildren}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export { Table };
