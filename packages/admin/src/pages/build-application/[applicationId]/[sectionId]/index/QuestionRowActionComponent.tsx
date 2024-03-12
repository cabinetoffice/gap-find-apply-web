import CustomLink from '../../../../../components/custom-link/CustomLink';
import InferProps from '../../../../../types/InferProps';
import { getServerSideProps } from '../index.page';
import styles from './index.module.scss';

type Question = NonNullable<
  InferProps<typeof getServerSideProps>['section']['questions']
>[0];

type QuestionRowActionComponentProps = {
  section: InferProps<typeof getServerSideProps>['section'];
  questions: Question[];
  question: Question;
  questionIndex: number;
  applicationId: string;
  handleOnUpDownButtonClick: () => void;
};

const QuestionRowActionComponent = ({
  section,
  questions,
  question,
  questionIndex,
  applicationId,
  handleOnUpDownButtonClick,
}: QuestionRowActionComponentProps) => {
  return (
    <div className="govuk-!-text-align-right govuk-!-padding-top-4">
      <div className="">
        <button
          className={`govuk-button govuk-button--secondary govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['button']}`}
          data-module="govuk-button"
          data-cy="cyUpButton"
          name={`Up/${question.questionId}`}
          disabled={questionIndex === 0}
          onClick={handleOnUpDownButtonClick}
          aria-label={`Move question ${question.fieldTitle} up`}
        >
          Up
        </button>
        <button
          className={`govuk-button govuk-button--secondary govuk-!-margin-right-2 govuk-!-margin-bottom-0 ${styles['button']}`}
          data-module="govuk-button"
          data-cy="cyDownButton"
          name={`Down/${question.questionId}`}
          disabled={questionIndex === questions.length - 1}
          onClick={handleOnUpDownButtonClick}
          aria-label={`Move question ${question.fieldTitle} down`}
        >
          Down
        </button>

        <CustomLink
          href={`/build-application/${applicationId}/${section.sectionId}/${question.questionId}/edit/question-content`}
          customStyle={`${styles['wrap']}`}
        >
          Edit
        </CustomLink>
      </div>
    </div>
  );
};

export default QuestionRowActionComponent;
