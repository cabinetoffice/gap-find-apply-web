import { TableProps } from './TableType';

const Table = ({
  tableName,
  tableCaptionClassName = '',
  tableClassName = '',
  firstCellIsHeader = false,
  tableHeadColumns,
  rows,
  tableAttributes,
  isLastCellAStatusTag = false,
}: TableProps) => {
  const tableNameComponent = (
    <caption
      className={`govuk-table__caption ${tableCaptionClassName}`}
      data-testid="table-caption"
    >
      {tableName}
    </caption>
  );

  const tableHeadComponent = (
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        {tableHeadColumns?.map((column, index) => {
          return (
            <th
              key={index}
              scope="col"
              className={`govuk-table__header ${
                column.classNames ? column.classNames : ''
              }`}
              {...column.theadColumnAttributes}
              data-cy={`cy_tableColumnName_${column.name}`}
            >
              {column.name}
            </th>
          );
        })}
      </tr>
    </thead>
  );

  const isFirstCellAHeader = (cellIndex: number) => {
    return cellIndex === 0 && firstCellIsHeader;
  };

  return (
    <table className={`govuk-table ${tableClassName}`} {...tableAttributes}>
      {!!tableName && tableNameComponent}
      {!!tableHeadColumns && tableHeadComponent}

      <tbody className="govuk-table__body" data-cy="cy_TableBody">
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="govuk-table__row"
            data-cy="cy_table_row"
          >
            {row.cells.map((cell, cellIndex) => {
              const cellClassName = cell.classNames ? cell.classNames : '';
              const lastCell = row.cells.length - 1;
              if (isFirstCellAHeader(cellIndex)) {
                return (
                  <th
                    key={cellIndex}
                    scope="row"
                    className={`govuk-table__header ${cellClassName}`}
                    {...cell.cellAttributes}
                  >
                    {cell.content}
                  </th>
                );
              }
              return (
                <td
                  key={cellIndex}
                  className={`govuk-table__cell ${cellClassName} ${
                    isLastCellAStatusTag && cellIndex === lastCell
                      ? 'govuk-!-text-align-right'
                      : ''
                  }`}
                  {...cell.cellAttributes}
                >
                  {cell.content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
