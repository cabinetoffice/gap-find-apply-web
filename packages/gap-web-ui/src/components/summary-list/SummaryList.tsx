import React from 'react';
import styles from './SummaryList.module.scss';

export interface SummaryListProps {
  summaryListAttributes?: Record<string, unknown>;
  rows: Row[];
  displayRegularKeyFont?: boolean;
  hasWiderKeyColumn?: boolean;
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
}: SummaryListProps) => {
  return (
    <dl
      className={`govuk-summary-list`}
      data-testid="summary-list"
      {...summaryListAttributes}
    >
      {rows.map((row) => (
        <div className="govuk-summary-list__row" key={row.key}>
          <dt
            className={`govuk-summary-list__key 
            ${
              displayRegularKeyFont
                ? ' ' + styles['gap-summary-list--key-weight-regular'] + ' '
                : ''
            }
               ${
                 hasWiderKeyColumn ? ' ' + styles['key-width-40percent-sm'] : ''
               }
            `}
          >
            {row.key}
          </dt>
          <dd
            className="govuk-summary-list__value"
            data-cy={`cy_summaryListValue_${row.key}`}
          >
            {row.value}
          </dd>
          {row.action && (
            <dd className="govuk-summary-list__actions">{row.action}</dd>
          )}
        </div>
      ))}
    </dl>
  );
};

export default SummaryList;
