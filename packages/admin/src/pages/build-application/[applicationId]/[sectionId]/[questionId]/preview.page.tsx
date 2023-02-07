import { GetServerSidePropsContext } from 'next';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import InferProps from '../../../../../types/InferProps';
import { generateErrorPageRedirect } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import PreviewInputSwitch from './preview-input-switch';
import styles from './preview.module.scss';

export const getServerSideProps = async ({
  params,
  req,
}: GetServerSidePropsContext) => {
  const { applicationId, sectionId, questionId } = params as Record<
    string,
    string
  >;
  let applicationFormSummary;
  try {
    applicationFormSummary = await getApplicationFormSummary(
      applicationId,
      getSessionIdFromCookies(req)
    );
  } catch (err: any) {
    return generateErrorPageRedirect(
      'Something went wrong while trying to preview this question.',
      `/build-application/${applicationId}/dashboard`
    );
  }

  const question = applicationFormSummary.sections
    .find((section) => section.sectionId === sectionId)
    ?.questions?.find((question) => question.questionId === questionId);

  if (!question) {
    return generateErrorPageRedirect(
      `Could not find the question, please make sure the URL is correct`,
      `/build-application/${applicationId}/dashboard`
    );
  }

  return {
    props: {
      question: question,
      changeHref: `/build-application/${applicationId}/${sectionId}/${questionId}/edit/question-content`,
      backHref: `/build-application/${applicationId}/dashboard`,
      applicationFormStatus: applicationFormSummary.applicationStatus,
    },
  };
};

const PreviewQuestion = ({
  question,
  changeHref,
  backHref,
  applicationFormStatus,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title="Preview a question - Manage a grant" />

      <CustomLink href={backHref} isBackButton />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-!-padding-top-7">
            <div
              className={`govuk-!-padding-6 ${styles['gap-light-grey-background']}`}
            >
              <span
                className="govuk-caption-l"
                data-testid="question-page-caption"
                data-cy="cy_questionPreviewPage-captionText"
              >
                How this will look to the applicant
              </span>

              <PreviewInputSwitch {...question} />

              <div className="govuk-button-group">
                <a
                  role="button"
                  draggable="false"
                  className="govuk-button"
                  data-module="govuk-button"
                  data-cy="cy_questionPreviewPage-SaveandContinueButton"
                >
                  Save and continue
                </a>
                <a
                  role="button"
                  draggable="false"
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  data-cy="cy_questionPreviewPage-disabledSaveandExitButton"
                >
                  Save and exit
                </a>
              </div>
            </div>
          </div>

          {applicationFormStatus === 'PUBLISHED' ? (
            <div className="govuk-!-padding-top-6">
              <CustomLink
                href={backHref}
                customStyle="govuk-!-font-size-19"
                dataCy="cy_questionPreview-returnToApplicationFormButton-published"
              >
                Return to application form
              </CustomLink>
            </div>
          ) : (
            <div>
              <h2
                className="govuk-heading-m govuk-!-margin-top-9"
                data-cy="cy_questionPreview-h2ToChangeQuestionText"
              >
                Would you like to change this question?
              </h2>
              <p className="govuk-body">
                You can edit the question title and description.
              </p>

              <div className="govuk-button-group">
                <CustomLink
                  href={changeHref}
                  isButton
                  dataCy="cy_questionPreview-changeQuestionButton"
                >
                  Change
                </CustomLink>
                <CustomLink
                  href={backHref}
                  dataCy="cy_questionPreview-returnToApplicationFormButton"
                >
                  Return to application form
                </CustomLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PreviewQuestion;
