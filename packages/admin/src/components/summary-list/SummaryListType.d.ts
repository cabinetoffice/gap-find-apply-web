interface SummaryListProps {
  summaryListClassName?: string;
  summaryListAttributes?: object;
  rows: Row[];
}

interface Row {
  key: string;
  value: string;
  action?: Action;
}

interface Action {
  href: string;
  label: string;
  ariaLabel?: string;
}

export default SummaryListProps;
