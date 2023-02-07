import React from 'react';
import gloss from '../../utils/glossary.json';

const SupportingDocuments = ({ supportingDocumentsSet }) => {
  return (
    <>
      {supportingDocumentsSet.map((item, i) => (
        <React.Fragment key={i}>
          <div className="govuk-grid-row govuk-!-margin-bottom-6">
            <div className="govuk-grid-column-one-third">
              <h2 className="govuk-heading-m govuk-!-margin-0">
                {item.fields.title}
              </h2>
            </div>
            <div className="govuk-grid-column-two-thirds">
              <p>{item.fields.description}</p>
              <p>
                {gloss.grantDetails.tabs.fileType}:{' '}
                {item.fields.file.contentType.replace('application/', '')}
              </p>
              <p>
                <a
                  className="govuk-link"
                  href={`https:${item.fields.file.url}`}
                >
                  {item.fields.file.fileName}
                </a>{' '}
                ({Math.round(item.fields.file.details.size / 1024)} Kb)
              </p>
            </div>
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default SupportingDocuments;
