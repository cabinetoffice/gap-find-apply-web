import { GetServerSideProps } from 'next';
import getConfig from 'next/config';
import Link from 'next/link';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import {
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  QuestionType,
  SectionData,
} from '../../../services/SubmissionService';
import { getApplicationStatusBySchemeId } from '../../../services/ApplicationService';
import { GrantMandatoryQuestionService } from '../../../services/GrantMandatoryQuestionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { ProcessMultiResponse } from './sections/[sectionId]/processMultiResponse';
import { getQuestionUrl } from './sections/[sectionId]/index.page';
import { ImportantBanner } from 'gap-web-ui';
import { fetchSubmission } from '../../../services/SubmissionService';
import { redirect } from 'next/dist/server/api-utils';

const { publicRuntimeConfig } = getConfig();

export interface SubmissionSummaryPage {
  sections: SectionData[];
  grantSubmissionId: string;
  mandatoryQuestionId: string;
  applicationName: string;
  hasSubmissionBeenSubmitted: boolean;
  csrfToken: string;
}

export const getServerSideProps: GetServerSideProps<
  SubmissionSummaryPage
> = async ({ req, res, params }) => {
  const jwt = getJwtFromCookies(req);
  const submissionId = params.submissionId.toString();

  const {
    sections,
    grantSubmissionId,
    applicationName,
    grantSchemeId,
    submissionStatus,
  } = await getSubmissionById(submissionId, getJwtFromCookies(req));

  const submissionExists =
    submissionStatus === 'IN_PROGRESS' || 'SUBMITTED' || 'GRANT_CLOSED';

  if (!submissionExists) {
    return {
      redirect: {
        destination: `/grant-is-closed`,
        permanent: false,
      },
    };
  }

  const grantApplicationStatus = await getApplicationStatusBySchemeId(
    grantSchemeId,
    jwt
  );
  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(submissionId, jwt);

  const closedAndInProgress =
    grantApplicationStatus === 'REMOVED' && submissionExists;

  const hydratedSections = await Promise.all(
    sections.map(async (section) => {
      return {
        ...section,
        questions: await Promise.all(
          section.questionIds.map(async (questionId) => {
            const questionData = await getQuestionById(
              submissionId,
              section.sectionId,
              questionId,
              jwt
            );
            return questionData.question;
          })
        ),
      };
    })
  );

  let mandatoryQuestionId = null;
  try {
    const mandatoryQuestionService =
      GrantMandatoryQuestionService.getInstance();
    const mandatoryQuestionDto =
      await mandatoryQuestionService.getMandatoryQuestionBySubmissionId(
        submissionId,
        jwt
      );
    mandatoryQuestionId = mandatoryQuestionDto?.id || null;
  } catch (e) {
    // do nothing
  }

  return {
    props: {
      sections: hydratedSections,
      grantSubmissionId,
      mandatoryQuestionId,
      applicationName,
      hasSubmissionBeenSubmitted: hasBeenSubmitted,
      csrfToken: res.getHeader('x-csrf-token') as string,
      closedAndInProgress: closedAndInProgress,
    },
  };
};

export default function SubmissionSummary({
  sections,
  grantSubmissionId,
  mandatoryQuestionId,
  applicationName,
  hasSubmissionBeenSubmitted,
  csrfToken,
  closedAndInProgress,
}) {
  return (
    <>
      <Meta title="My application - Apply for a grant" />
      <Layout
        backBtnUrl={
          hasSubmissionBeenSubmitted || closedAndInProgress
            ? routes.applications
            : routes.submissions.sections(grantSubmissionId)
        }
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <form
              action={
                publicRuntimeConfig.subPath +
                routes.submissions.submit(grantSubmissionId)
              }
              method="POST"
            >
              {closedAndInProgress && (
                <ImportantBanner
                  bannerHeading="This grant has closed. You cannot submit your application"
                  bannerContent="You can still view your answers and download a copy of your application on this page."
                />)}
              <span
                className="govuk-caption-l"
                data-cy={`cy-application-name-${applicationName}`}
              >
                {applicationName}
              </span>
              <h1 className="govuk-heading-l" data-cy="cy-page-header">
                {hasSubmissionBeenSubmitted
                  ? 'Your application'
                  : 'Check your answers before submitting your application'}
              </h1>

              {sections.map((section: SectionData) => (
                <SectionCard
                  key={`section-card-${section.sectionId}`}
                  section={section}
                  submissionId={grantSubmissionId}
                  mandatoryQuestionId={mandatoryQuestionId}
                  readOnly={hasSubmissionBeenSubmitted || closedAndInProgress}
                />
              ))}

              <h1 className="govuk-heading-s" data-cy="cy-download-header">
                Download a copy of your application
              </h1>
              <p className="govuk-body">
                You can {/* <Link */}
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  href={routes.api.submissions.downloadSummary(
                    grantSubmissionId
                  )}
                >
                  download a copy of your answers (ZIP)
                </a>
                {/* </Link>{' '} */}
                for future reference.
              </p>

              {hasSubmissionBeenSubmitted || closedAndInProgress ? (
                <div className="govuk-button-group">
                  <a
                    href={publicRuntimeConfig.subPath + routes.applications}
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--secondary govuk-!-margin-top-6"
                    data-module="govuk-button"
                    data-cy="cy-return-to-profile-link"
                  >
                    Return to your profile
                  </a>
                </div>
              ) : (
                <>
                  <h1 className="govuk-heading-s" data-cy="cy-submit-header">
                    Submit your application
                  </h1>
                  <p className="govuk-body">
                    By submitting your application you are confirming that, to
                    the best of your knowledge, the details you are providing
                    are up to date and accurate.
                  </p>

                  <input type="hidden" name="_csrf" value={csrfToken} />

                  <div className="govuk-button-group">
                    <a
                      href={
                        publicRuntimeConfig.subPath +
                        routes.submissions.submit(grantSubmissionId)
                      }
                      role="button"
                      draggable="false"
                      className="govuk-button govuk-!-margin-top-6"
                      data-module="govuk-button"
                      data-cy="cy-submit-application-link"
                    >
                      Submit application
                    </a>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const SectionCard = ({
  section,
  submissionId,
  mandatoryQuestionId,
  readOnly,
}) => {
  return (
    <div className="govuk-summary-card">
      <div className="govuk-summary-card__title-wrapper">
        <h2 className="govuk-summary-card__title">{section.sectionTitle}</h2>
      </div>
      <div className="govuk-summary-card__content">
        <dl className="govuk-summary-list">
          {section.questions.map((question: QuestionType) => (
            <QuestionRow
              key={`question-${question.questionId}`}
              {...{
                question,
                section,
                submissionId,
                mandatoryQuestionId,
                readOnly,
              }}
            />
          ))}
        </dl>
      </div>
    </div>
  );
};

export const QuestionRow = ({
  question,
  section,
  submissionId,
  mandatoryQuestionId,
  readOnly,
}) => {
  const { questionId, fieldTitle, multiResponse, responseType, response } =
    question;
  const hasMultiResponse =
    multiResponse?.length > 0 && multiResponse.some(Boolean);
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{fieldTitle}</dt>
      {hasMultiResponse ? (
        <ProcessMultiResponse
          data={multiResponse}
          id={questionId}
          cyTag={questionId}
          questionType={responseType}
        />
      ) : (
        <dd
          className="govuk-summary-list__value"
          id={response}
          data-cy={`cy-section-value-${response}`}
        >
          {response ? response : '-'}
        </dd>
      )}
      {!readOnly && (
        <dd
          className="govuk-summary-list__actions"
          aria-describedby={`change-button-${questionId}`}
        >
          <Link
            href={getQuestionUrl(
              section.sectionId,
              questionId,
              mandatoryQuestionId,
              submissionId,
              'fromSubmissionSummaryPage'
            )}
            id={`change-button-${questionId}`}
            className="govuk-link govuk-link--no-visited-state"
            data-cy={`cy-section-details-navigation-${questionId}`}
          >
            {response || multiResponse ? 'Change' : 'Add'}
          </Link>
        </dd>
      )}
    </div>
  );
};
