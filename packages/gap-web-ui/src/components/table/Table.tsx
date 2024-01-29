import React from 'react';
import styles from './Table.module.scss';

export interface TableProps {
  caption?: string | JSX.Element;
  captionSize?: 's' | 'm' | 'l' | 'xl';
  captionClassName?: string;
  forceCellTopBorder?: boolean;
  tHeadColumns: TheadColumn[]; //needed for accessibility
  rows: Row[];
  tableAttributes?: Record<string, unknown>;
  tableClassName?: string;
  alignLastCellToTheRight?: boolean;
  disableBottomRowBorder?: boolean;
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
  wrapText?: boolean;
}

export interface Row {
  cells: Cell[];
}

interface Cell {
  content: string | number | JSX.Element;
  cellAttributes?: Record<string, unknown>;
  className?: string;
}

const Table = ({
  caption,
  captionSize,
  captionClassName,
  forceCellTopBorder,
  tHeadColumns,
  rows,
  tableAttributes,
  tableClassName,
  alignLastCellToTheRight = false,
  disableBottomRowBorder = false,
}: TableProps) => {
  return (
    <table className={`govuk-table ${tableClassName}`} {...tableAttributes}>
      {caption && (
        <caption
          className={`govuk-table__caption${
            captionSize ? ` govuk-table__caption--${captionSize}` : ''
          } ${captionClassName}`}
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
              const column = tHeadColumns[cellIndex];
              return (
                <td
                  key={cellIndex}
                  className={`govuk-table__cell${
                    tHeadColumns[cellIndex].isNumber
                      ? ' govuk-table__cell--numeric'
                      : ''
                  } ${cell.className} ${
                    disableBottomRowBorder && rowIndex === rows.length - 1
                      ? ' ' + styles['disable-bottom-row-border']
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
                    column.width && column.isVisuallyHidden
                      ? ' govuk-!-width-' + tHeadColumns[cellIndex].width
                      : ''
                  }${
                    column.wrapText
                      ? ` ${styles['gap-table-cell-wrap-text']}`
                      : ''
                  }`}
                  {...cell.cellAttributes}
                  data-cy={`cy_table_row-for-${
                    caption ? caption : column.name
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
