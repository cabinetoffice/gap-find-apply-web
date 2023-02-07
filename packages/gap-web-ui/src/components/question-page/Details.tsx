import React from 'react';
export interface DetailsType {
  title: string;
  text: string;
  newLineAccepted?: boolean;
}

const Details = ({ title, text, newLineAccepted = true }: DetailsType) => {
  const newLineClass = newLineAccepted ? `gap-new-line` : '';
  return (
    <>
      <details
        className="govuk-details"
        data-module="govuk-details"
        data-cy="cy-details-wrapper"
      >
        <summary className="govuk-details__summary">
          <span
            className="govuk-details__summary-text"
            data-cy="cy-details-title"
          >
            {title}
          </span>
        </summary>
        <div className={`govuk-details__text ${newLineClass}`}>{text}</div>
      </details>
    </>
  );
};

export default Details;
