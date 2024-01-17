import React from 'react';
import styles from './SummaryList.module.scss';

export interface SummaryListProps {
  summaryListAttributes?: Record<string, unknown>;
  rows: Row[];
  displayRegularKeyFont?: boolean;
  hasWiderKeyColumn?: boolean;
  boldHeaderRow?: boolean;
}

export interface Row {
  key: string;
  value: string | JSX.Element;
  action?: string | JSX.Element;
}

const SummaryList = ({
  summaryListAttributes,
  rows,
  displayRegularKeyFont = false,
  hasWiderKeyColumn = false,
  boldHeaderRow,
}: SummaryListProps) => {
  return (
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
              className={`govuk-summary-list__key 
            ${
              displayRegularKeyFont
                ? ' ' + styles['gap-summary-list--key-weight-regular'] + ' '
                : ''
            }
               ${
                 hasWiderKeyColumn ? ' ' + styles['key-width-45percent-sm'] : ''
               }
            `}
            >
              <div>{row.key}</div>
            </dt>
            <dd
              className={`govuk-summary-list__value${
                useBoldFont ? ' govuk-!-font-weight-bold' : ''
              }`}
              data-cy={`cy_summaryListValue_${row.key}`}
            >
              <div>{row.value}</div>
            </dd>
            {row.action && (
              <dd
                className={`govuk-summary-list__actions${
                  useBoldFont ? ' govuk-!-font-weight-bold' : ''
                }`}
              >
                {row.action}
              </dd>
            )}
          </div>
        );
      })}
    </dl>
  );
};

export default SummaryList;
