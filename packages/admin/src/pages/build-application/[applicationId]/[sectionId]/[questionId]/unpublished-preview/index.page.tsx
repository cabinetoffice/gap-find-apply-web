import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import PreviewInputSwitch from '../preview-input-switch';
import InferProps from '../../../../../../types/InferProps';
import { getQuestion } from '../../../../../../services/QuestionService';
import { getApplicationFormSection } from '../../../../../../services/ApplicationService';

export { getServerSideProps };

const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const sessionId = getSessionIdFromCookies(req);
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  const backHref = `/build-application/${applicationId}/preview`;

  const section = await getApplicationFormSection(
    applicationId,
    sectionId,
    sessionId
  );
  const currentQuestion = await getQuestion(
    sessionId,
    applicationId,
    sectionId,
    questionId
  );

  const questionIds = section?.questions!.map((q) => q.questionId);

  const lastQuestion = isLastQuestion(currentQuestion.questionId, questionIds);

  const nextQuestionId = lastQuestion
    ? null
    : getNextQuestionId(currentQuestion.questionId, questionIds);

  const nextPreviewHref = nextQuestionId
    ? `/build-application/${applicationId}/${sectionId}/${nextQuestionId}/unpublished-preview`
    : null;

  return {
    props: {
      question: currentQuestion,
      pageData: { sectionId, questionId },
      backHref: backHref,
      nextQuestion: nextQuestionId,
      nextPreviewHref: nextPreviewHref,
    },
  };
};

function getNextQuestionId(
  currentQuestionId: string,
  allQuestionIds: string[]
) {
  const currentIndex = allQuestionIds.findIndex(
    (id) => id === currentQuestionId
  );
  return allQuestionIds[currentIndex + 1];
}

function isLastQuestion(currentQuestionId: string, allQuestionIds: string[]) {
  const size = allQuestionIds.length;
  const lastQuestion = allQuestionIds[size - 1];
  return lastQuestion === currentQuestionId;
}

export default function PreviewQuestion({
  question,
  backHref,
  nextQuestion,
  nextPreviewHref,
}: InferProps<typeof getServerSideProps>) {
  return (
    <>
      <Meta title="Preview a question - Manage a grant" />

      <CustomLink href={backHref} isBackButton />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-!-padding-top-7">
            <div className={`govuk-!-padding-6`}>
              <span
                className="govuk-caption-l"
                data-testid="question-page-caption"
                data-cy="cy_questionPreviewPage-captionText"
              >
                Question preview
              </span>

              <PreviewInputSwitch {...question} disableTextBoxes={true} />

              {nextQuestion !== null ? (
                <div className="govuk-button-group">
                  <CustomLink href={nextPreviewHref as string} isButton={true}>
                    {'Preview next question'}
                  </CustomLink>
                  <CustomLink href={backHref} isSecondaryButton={true}>
                    {'Back to overview'}
                  </CustomLink>
                </div>
              ) : (
                <CustomLink href={backHref} isButton={true}>
                  {'Back to overview'}
                </CustomLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
