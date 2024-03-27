import { FC } from 'react';
import { QuestionType } from '../../../../../types/SubmissionSummary';

export const QuestionRow = (question: QuestionType) => {
  let hasMultiResponse;
  const { multiResponse } = question;
  if (multiResponse) {
    hasMultiResponse = multiResponse.length > 0 && multiResponse.some(Boolean);
  }
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{question.fieldTitle}</dt>
      {hasMultiResponse ? (
        <ProcessMultiResponse
          data={multiResponse}
          id={question.questionId}
          cyTag={question.questionId}
          questionType={question.responseType}
        />
      ) : (
        <dd
          className="govuk-summary-list__value"
          id={question.response}
          data-cy={`cy-section-value-${question.response}`}
        >
          {question.response ? question.response : '-'}
        </dd>
      )}
    </div>
  );
};

interface ProcessMultiResponseProps {
  data: string | string[] | undefined;
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
  const formatDate = (date: string[] | string) =>
    Array.isArray(date) && date.some(Boolean) ? date.join('-') : '-';

  const displayMultiResponse = (
    <>
      <dd
        className="govuk-summary-list__value"
        data-cy={`cy-organisation-value-${cyTag}`}
      >
        <>
          {isDate ? (
            formatDate(multiResponseData)
          ) : (
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
