export function HomepageBodyText({ children, heading }) {
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full govuk-!-margin-top-8">
        <h2 className="govuk-heading-l govuk-!-font-size-27 govuk-!-margin-top-0">
          {heading}
        </h2>
        {children}
      </div>
    </div>
  );
}
