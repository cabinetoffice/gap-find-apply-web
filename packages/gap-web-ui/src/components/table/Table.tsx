import React from 'react';
import styles from './Table.module.scss';

export interface TableProps {
  caption?: string;
  captionSize?: 's' | 'm' | 'l' | 'xl';
  forceCellTopBorder?: boolean;
  tHeadColumns: TheadColumn[]; //needed for accessibility
  rows: Row[];
  tableAttributes?: Record<string, unknown>;
  tableClassName?: string;
  alignLastCellToTheRight?: boolean;
}

export interface TheadColumn {
  name: string | JSX.Element;
  isVisuallyHidden?: boolean;
  isNumber?: boolean;
  width?:
    | 'full'
    | 'three-quarters'
    | 'two-thirds'
    | 'one-half'
    | 'one-third'
    | 'one-quarter';
  theadColumnAttributes?: Record<string, unknown>;
}

export interface Row {
  cells: Cell[];
}

interface Cell {
  content: string | number | JSX.Element;
  cellAttributes?: Record<string, unknown>;
}

const Table = ({
  caption,
  captionSize,
  forceCellTopBorder,
  tHeadColumns,
  rows,
  tableAttributes,
  tableClassName,
  alignLastCellToTheRight = false,
}: TableProps) => {
  return (
    <table className={`govuk-table ${tableClassName}`} {...tableAttributes}>
      {caption && (
        <caption
          className={`govuk-table__caption${
            captionSize ? ` govuk-table__caption--${captionSize}` : ''
          }`}
          data-testid="table-caption"
          data-cy={`cy-table-caption-${caption}`}
        >
          {caption}
        </caption>
      )}

      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {tHeadColumns.map((column, index) => {
            const className = `govuk-table__header
              ${column.isNumber ? ' govuk-table__header--numeric' : ''}
              ${column.isVisuallyHidden ? ' govuk-visually-hidden' : ''}
              ${column.width ? ' govuk-!-width-' + column.width : ''}
              ${
                column.isVisuallyHidden && column.width
                  ? ' ' + styles['gap-thead-static-position']
                  : ''
              }`;

            return (
              <th
                key={index}
                scope="col"
                className={className}
                {...column.theadColumnAttributes}
                data-cy={`cy_tableColumnName_${column.name}`}
              >
                {column.name}
              </th>
            );
          })}
        </tr>
      </thead>

      <tbody className="govuk-table__body" data-cy="cy_TableBody">
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="govuk-table__row"
            data-cy={`cy_table_row-for-${caption}`}
          >
            {row.cells.map((cell, cellIndex) => {
              const lastCell = row.cells.length - 1;
              return (
                <td
                  key={cellIndex}
                  className={`govuk-table__cell${
                    tHeadColumns[cellIndex].isNumber
                      ? ' govuk-table__cell--numeric'
                      : ''
                  }${
                    forceCellTopBorder
                      ? ' ' + styles['gap-table-cell-top-border']
                      : ''
                  }${
                    alignLastCellToTheRight && cellIndex === lastCell
                      ? ' govuk-!-text-align-right'
                      : ''
                  }${
                    tHeadColumns[cellIndex].width &&
                    tHeadColumns[cellIndex].isVisuallyHidden
                      ? ' govuk-!-width-' + tHeadColumns[cellIndex].width
                      : ''
                  }`}
                  {...cell.cellAttributes}
                  data-cy={`cy_table_row-for-${
                    caption ? caption : tHeadColumns[cellIndex].name
                  }-row-${rowIndex}-cell-${cellIndex}`}
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
