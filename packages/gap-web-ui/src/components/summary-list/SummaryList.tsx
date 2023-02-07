import React from 'react';
import styles from './SummaryList.module.scss';

export interface SummaryListProps {
  summaryListAttributes?: Record<string, unknown>;
  rows: Row[];
  displayRegularKeyFont?: boolean;
}

interface Row {
  key: string;
  // eslint-disable-next-line no-undef
  value: string | JSX.Element;
  // eslint-disable-next-line no-undef
  action?: JSX.Element;
}

const SummaryList = ({
  summaryListAttributes,
  rows,
  displayRegularKeyFont = false,
}: SummaryListProps) => {
  return (
    <dl
      className="govuk-summary-list"
      data-testid="summary-list"
      {...summaryListAttributes}
    >
      {rows.map((row) => (
        <div className="govuk-summary-list__row" key={row.key}>
          <dt
            className={`govuk-summary-list__key${
              displayRegularKeyFont
                ? ' ' + styles['gap-summary-list--key-weight-regular']
                : ''
            }`}
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
