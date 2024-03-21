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
  currentId: string;
  allIds: string[];
}

const isLastQuestion = ({ currentId, allIds }: IDParameters) =>
  allIds[allIds.length - 1] === currentId;

const isFirstQuestion = ({ currentId, allIds }: IDParameters) =>
  allIds[0] === currentId;

const getCurrentIndex = ({ currentId, allIds }: IDParameters) =>
  allIds.findIndex((id) => id === currentId);

function getNextQuestionId(idParams: IDParameters) {
  if (isLastQuestion(idParams)) return null;
  const currentIndex = getCurrentIndex(idParams);
  return idParams.allIds[currentIndex + 1];
}

const getPrevQuestionId = (idParams: IDParameters) =>
  idParams.allIds[getCurrentIndex(idParams) - 1];

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

    const allIds = section?.questions!.map((q) => q.questionId);

    const idParams: IDParameters = {
      currentId: questionId,
      allIds,
    };

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
