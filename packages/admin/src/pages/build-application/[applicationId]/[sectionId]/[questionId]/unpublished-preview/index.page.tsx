import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import PreviewInputSwitch from '../preview-input-switch';
import InferProps from '../../../../../../types/InferProps';
import { getQuestion } from '../../../../../../services/QuestionService';
import { getApplicationFormSection } from '../../../../../../services/ApplicationService';
import {
  generateErrorPageRedirect,
  generateErrorPageRedirectV2,
} from '../../../../../../utils/serviceErrorHelpers';
import CustomError from '../../../../../../types/CustomError';
import { AxiosError } from 'axios';

export { getServerSideProps };

const isLastQuestion = (currentQuestionId: string, allQuestionIds: string[]) =>
  allQuestionIds[allQuestionIds.length - 1] === currentQuestionId;

function getNextQuestionId(
  currentQuestionId: string,
  allQuestionIds: string[]
) {
  if (isLastQuestion(currentQuestionId, allQuestionIds)) return null;
  const currentIndex = allQuestionIds.findIndex(
    (id) => id === currentQuestionId
  );
  return allQuestionIds[currentIndex + 1];
}

const getServerSideProps = async ({
  params,
  req,
  query,
}: GetServerSidePropsContext) => {
  const isV2Scheme = query.v2 === 'true';
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  const backHref = `/build-application/${applicationId}/preview`;
  try {
    const sessionId = getSessionIdFromCookies(req);

    const section = await getApplicationFormSection(
      applicationId,
      sectionId,
      sessionId,
      isV2Scheme
    );

    if (!section) {
      return generateErrorPageRedirect(
        `Could not find the section, please make sure the URL is correct`,
        `/build-application/${applicationId}/dashboard`
      );
    }
    const currentQuestion = await getQuestion(
      sessionId,
      applicationId,
      sectionId,
      questionId,
      isV2Scheme
    );

    if (!currentQuestion) {
      return generateErrorPageRedirect(
        `Could not find the question, please make sure the URL is correct`,
        `/build-application/${applicationId}/dashboard`
      );
    }

    const questionIds = section?.questions!.map((q) => q.questionId);

    const nextQuestionId = getNextQuestionId(questionId, questionIds);

    const nextPreviewHref = nextQuestionId
      ? `/build-application/${applicationId}/${sectionId}/${nextQuestionId}/unpublished-preview${
          isV2Scheme ? '?v2=true' : ''
        }`
      : null;

    return {
      props: {
        question: currentQuestion,
        backHref,
        nextPreviewHref,
      },
    };
  } catch (err: unknown) {
    console.error('Error rendering question preview -> ', err);
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(errorMessageObject.code, backHref);
  }
};

export default function UnpublishedPreviewQuestion({
  question,
  backHref,
  nextPreviewHref,
}: InferProps<typeof getServerSideProps>) {
  const hasNextQuestion = nextPreviewHref !== null;
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

              <PreviewInputSwitch {...question} disableTextBoxes />

              {hasNextQuestion ? (
                <div className="govuk-button-group">
                  <CustomLink href={nextPreviewHref as string} isButton>
                    Preview next question
                  </CustomLink>
                  <CustomLink href={backHref} isSecondaryButton>
                    Back to overview
                  </CustomLink>
                </div>
              ) : (
                <CustomLink href={backHref} isButton>
                  Back to overview
                </CustomLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
