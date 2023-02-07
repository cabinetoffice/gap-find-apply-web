import React from 'react';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

const TwoColumnContent = ({ summaryTwoColumn }) => {
  return (
    <>
      {summaryTwoColumn.map((item, i) => (
        <React.Fragment key={i}>
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-one-third">
              <h2 className="govuk-heading-m govuk-!-margin-0">
                {item.data.target.fields.label}
              </h2>
            </div>
            <div className="govuk-grid-column-two-thirds">
              {documentToReactComponents(item.data.target.fields.content)}
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default TwoColumnContent;
