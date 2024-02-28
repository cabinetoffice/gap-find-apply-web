import React from 'react';
import styles from './SummaryList.module.scss';

export interface SummaryListProps {
  summaryListAttributes?: Record<string, unknown>;
  rows: Row[];
  displayRegularKeyFont?: boolean;
  hasWiderKeyColumn?: boolean;
  boldHeaderRow?: boolean;
  equalColumns?: boolean;
  actionTextLeft?: boolean;
}

export interface Row {
  key: string;
  value: string | JSX.Element;
  action?: string | JSX.Element;
}

const STYLE_MAP = {
  displayRegularKeyFont: 'gap-summary-list--key-weight-regular',
  hasWiderKeyColumn: 'key-width-45percent-sm',
  equalColumns: 'equal-columns',
  useBoldFont: 'fw-bold',
  actionTextLeft: 'text-left',
};

type StyleOptions = {
  [Key in keyof typeof STYLE_MAP]?: boolean;
};

const getClassName = (inputStr: string, options: StyleOptions) =>
  Object.entries(options).reduce((acc, [option, style]) => {
    const mappedStyle = STYLE_MAP[option as keyof typeof STYLE_MAP];
    if (style && mappedStyle) acc += ` ${styles[mappedStyle]}`;
    return acc;
  }, inputStr);

const SummaryList = ({
  summaryListAttributes,
  rows,
  displayRegularKeyFont = false,
  hasWiderKeyColumn = false,
  boldHeaderRow,
  equalColumns,
  actionTextLeft,
}: SummaryListProps) => (
  <dl
    className={`govuk-summary-list`}
    data-testid="summary-list"
    {...summaryListAttributes}
  >
    {rows.map((row, index) => {
      const useBoldFont = boldHeaderRow && index === 0;

      return (
        <div className="govuk-summary-list__row" key={row.key}>
          <dt
            className={getClassName('govuk-summary-list__key ', {
              displayRegularKeyFont,
              hasWiderKeyColumn,
              equalColumns,
            })}
          >
            <div>{row.key}</div>
          </dt>
          <dd
            className={getClassName(`govuk-summary-list__value `, {
              useBoldFont,
              equalColumns,
            })}
            data-cy={`cy_summaryListValue_${row.key}`}
          >
            <div>{row.value}</div>
          </dd>
          {row.action && (
            <dd
              className={getClassName(`govuk-summary-list__actions `, {
                useBoldFont,
                equalColumns,
                actionTextLeft,
              })}
            >
              {row.action}
            </dd>
          )}
        </div>
      );
    })}
  </dl>
);

export default SummaryList;
