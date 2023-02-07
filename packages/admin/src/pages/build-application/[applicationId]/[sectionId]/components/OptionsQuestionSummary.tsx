import ResponseType from '../../../../../enums/ResponseType';
import { QuestionWithOptionsSummary } from '../../../../../types/QuestionSummary';

const OptionsQuestionSummary = ({
  questionSummary,
}: OptionsQuestionSummaryProps) => {
  let optionQuestionSummary: string = '';

  switch (questionSummary.responseType) {
    case ResponseType.Dropdown: {
      optionQuestionSummary =
        'You must enter at least two options. Applicants will only be able to choose one answer.';
      break;
    }
    case ResponseType.MultipleSelection: {
      optionQuestionSummary =
        'You must enter at least two options. Applicants will be able to choose one or more answers.';
      break;
    }
  }

  return (
    <div
      className="govuk-!-margin-top-4 govuk-!-margin-bottom-6"
      data-testid="options-question-summary"
    >
      <h1
        className="govuk-heading-l govuk-!-margin-bottom-2"
        data-cy="cy_questionOptionsPage-header"
      >
        {questionSummary.fieldTitle}
      </h1>
      {questionSummary.hintText && (
        <p
          className="govuk-body-m govuk-!-margin-top-2"
          data-testid="summary-hint-text"
          data-cy={`cy_questionOptionsPage-hintText`}
        >
          {questionSummary.hintText}
        </p>
      )}
      <p
        className="govuk-body-s govuk-!-margin-top-2"
        data-cy="cy_optionQuestionsPageSummary"
      >
        {optionQuestionSummary}
      </p>
    </div>
  );
};

type OptionsQuestionSummaryProps = {
  questionSummary: QuestionWithOptionsSummary;
};

export default OptionsQuestionSummary;
