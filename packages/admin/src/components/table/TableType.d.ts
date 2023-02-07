interface TableProps {
  tableName?: string;
  tableCaptionClassName?: string;
  tableClassName?: string;
  firstCellIsHeader?: boolean;
  tableHeadColumns?: TheadColumn[];
  rows: Row[];
  tableAttributes?: Object;
  isLastCellAStatusTag?: boolean;
}

interface TheadColumn {
  name: string;
  classNames?: string;
  theadColumnAttributes?: Object;
}

interface Row {
  cells: Cell[];
}

interface Cell {
  content: string | number | JSX.Element;
  classNames?: string;
  cellAttributes?: Object;
}

export { TableProps, TheadColumn, Row, Cell };
