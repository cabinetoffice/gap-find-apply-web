interface TableProps {
  tableName?: string;
  tableCaptionClassName?: string;
  tableClassName?: string;
  firstCellIsHeader?: boolean;
  tableHeadColumns?: TheadColumn[];
  rows: Row[];
  tableAttributes?: object;
  isLastCellAStatusTag?: boolean;
}

interface TheadColumn {
  name: string;
  classNames?: string;
  theadColumnAttributes?: object;
}

interface Row {
  cells: Cell[];
}

interface Cell {
  content: string | number | JSX.Element;
  classNames?: string;
  cellAttributes?: object;
}

export { TableProps, TheadColumn, Row, Cell };
