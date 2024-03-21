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

interface IDParameters {
  current: string;
  all: string[];
}

const isLastQuestion = (qIDs: IDParameters) =>
  qIDs.all[qIDs.all.length - 1] === qIDs.current;
const isFirstQuestion = (qIDs: IDParameters) => qIDs.all[0] === qIDs.current;

const getCurrentIndex = (qIDs: IDParameters) =>
  qIDs.all.findIndex((id) => id === qIDs.current);

function getNextQuestionId(qIDs: IDParameters) {
  if (isLastQuestion(qIDs)) return null;
  return qIDs.all[getCurrentIndex(qIDs) + 1];
}

const getPrevQuestionId = (qIDs: IDParameters) =>
  qIDs.all[getCurrentIndex(qIDs) - 1];

let backHref: string;

const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  try {
    const sessionId = getSessionIdFromCookies(req);

    const section = await getApplicationFormSection(
      applicationId,
      sectionId,
      sessionId
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
      questionId
    );
    if (!currentQuestion) {
      return generateErrorPageRedirect(
        `Could not find the question, please make sure the URL is correct`,
        `/build-application/${applicationId}/dashboard`
      );
    }

    const questionIds = section?.questions!.map((q) => q.questionId);

    const idParams: IDParameters = { current: questionId, all: questionIds };

    const nextQuestionId = getNextQuestionId(idParams);

    const nextPreviewHref = nextQuestionId
      ? `/build-application/${applicationId}/${sectionId}/${nextQuestionId}/unpublished-preview`
      : null;

    const prevQuestionId = getPrevQuestionId(idParams);

    backHref = isFirstQuestion(idParams)
      ? `/build-application/${applicationId}/preview`
      : `/build-application/${applicationId}/${sectionId}/${prevQuestionId}/unpublished-preview`;

    return {
      props: {
        question: currentQuestion,
        backHref: backHref,
        nextPreviewHref: nextPreviewHref,
        overviewHref: `/build-application/${applicationId}/preview`,
      },
    };
  } catch (err: unknown) {
    console.error('Error rendering application preview -> ', err);
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;
    return generateErrorPageRedirectV2(errorMessageObject.code, backHref);
  }
};

export default function UnpublishedPreviewQuestion({
  question,
  backHref,
  nextPreviewHref,
  overviewHref,
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

              <PreviewInputSwitch {...question} disableTextBoxes={true} />

              {hasNextQuestion ? (
                <div className="govuk-button-group">
                  <CustomLink href={nextPreviewHref as string} isButton={true}>
                    Preview next question
                  </CustomLink>
                  <CustomLink href={overviewHref} isSecondaryButton={true}>
                    Back to overview
                  </CustomLink>
                </div>
              ) : (
                <CustomLink href={overviewHref} isButton={true}>
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
