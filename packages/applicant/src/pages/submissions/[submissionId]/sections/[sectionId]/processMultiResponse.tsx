import { FC } from 'react';
interface ProcessMultiResponseProps {
  data: string | string[];
  id: string;
  cyTag: string;
  questionType: string;
}

export const ProcessMultiResponse: FC<ProcessMultiResponseProps> = ({
  data,
  id,
  cyTag,
  questionType,
}) => {
  const multiResponseData = data ? data : [];

  const multiResponseDetails = Array.isArray(multiResponseData)
    ? multiResponseData
    : multiResponseData.split(',');
  const isDate = questionType === 'Date';
  const displayMultiResponse = (
    <>
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-organisation-value-${cyTag}`}
      >
        <>
          {isDate && multiResponseDetails.join('-')}
          {!isDate && (
            <ul className="govuk-list">
              {multiResponseDetails.map(
                (line: string, index: number, array: string[]) => {
                  if (line) {
                    return (
                      <li key={index}>
                        {index === array.length - 1 ? line : `${line},`}
                      </li>
                    );
                  }
                }
              )}
            </ul>
          )}
        </>
      </dd>
    </>
  );

  return data ? (
    displayMultiResponse
  ) : (
    <dd
      className="govuk-summary-list__value"
      id={id}
      data-cy="cy-organisation-no-address-data"
    >
      -
    </dd>
  );
};
