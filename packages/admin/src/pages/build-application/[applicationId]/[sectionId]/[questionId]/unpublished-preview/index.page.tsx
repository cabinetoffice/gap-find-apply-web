import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../../components/layout/Meta';
import { generateErrorPageRedirect } from '../../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../../utils/session';
import PreviewInputSwitch from '../preview-input-switch';
import styles from '../preview.module.scss';
import InferProps from '../../../../../../types/InferProps';
import { getQuestion } from '../../../../../../services/QuestionService';

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
  const backHref = `/build-application/${applicationId}/dashboard`;

  //get the section

  //getQuestionCount = count number of questions for length

  //

  const currentQuestion = await getQuestion(
    sessionId,
    applicationId,
    sectionId,
    questionId
  );
  if (!currentQuestion) {
    return generateErrorPageRedirect(
      `Could not find the question, please make sure the URL is correct`,
      backHref
    );
  }

  return {
    props: {
      question: currentQuestion,
      pageData: { sectionId, questionId },
      backHref: backHref,
    },
  };
};

export default function DummyComponent({
  question,
  backHref,
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

              <PreviewInputSwitch {...question} />

              <div className="govuk-button-group">
                <CustomLink href={backHref} isSecondaryButton={true}>
                  {'Back to overview'}
                </CustomLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 1. create the page to figma (start by copy and pasting the existing preview page found here: packages/admin/src/pages/build-application/[applicationId]/[sectionId]/[questionId]/preview.page.tsx
// 2. dynamically populate the 'Preview next question' button - it needs to link to the next question id. You can get the next question id by checking the location of the current questionid against the array. Find that index then add 1 to it.
// 3. For last question behaviour - You'll know if you're on the last question  when the index of the current question is the same as the length of the question array - 1. (array index start at 0 in js)
