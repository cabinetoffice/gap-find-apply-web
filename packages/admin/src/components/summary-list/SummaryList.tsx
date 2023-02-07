import CustomLink from '../custom-link/CustomLink';
import SummaryListProps from './SummaryListType';

const SummaryList = ({
  summaryListClassName = '',
  summaryListAttributes,
  rows,
}: SummaryListProps) => {
  return (
    <dl
      className={`govuk-summary-list ${summaryListClassName}`}
      data-testid="summary-list"
      {...summaryListAttributes}
    >
      {rows.map((row, rowIndex) => (
        <div className="govuk-summary-list__row" key={rowIndex}>
          <dt className="govuk-summary-list__key">{row.key}</dt>
          <dd
            className="govuk-summary-list__value"
            data-cy={`cy_summaryListValue_${row.key}`}
          >
            {row.value || '–'}
          </dd>
          {row.action && (
            <dd className="govuk-summary-list__actions">
              <CustomLink
                href={row.action.href}
                dataCy={`cy_summaryListLink_${row.action.ariaLabel}`}
                ariaLabel={row.action.ariaLabel || row.action.label}
              >
                {row.action.label}
              </CustomLink>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
};

export default SummaryList;
