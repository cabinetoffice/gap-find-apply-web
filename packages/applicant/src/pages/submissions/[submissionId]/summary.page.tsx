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
import { initiateCSRFCookie } from '../../../utils/csrf';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { ProcessMultiResponse } from './sections/[sectionId]/processMultiResponse';

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

  const { sections, grantSubmissionId, applicationName, grantSchemeId } =
    await getSubmissionById(submissionId, getJwtFromCookies(req));

  const grantApplicationStatus = await getApplicationStatusBySchemeId(
    grantSchemeId,
    jwt
  );

  if (grantApplicationStatus === 'REMOVED') {
    return {
      redirect: {
        destination: `/grant-is-closed`,
        permanent: false,
      },
    };
  }

  const hasBeenSubmitted = await hasSubmissionBeenSubmitted(submissionId, jwt);

  await initiateCSRFCookie(req, res);

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
      csrfToken: (req as any).csrfToken?.() || '',
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
}) {
  return (
    <>
      <Meta title="My application - Apply for a grant" />
      <Layout backBtnUrl={routes.submissions.sections(grantSubmissionId)}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <form
              action={
                publicRuntimeConfig.subPath +
                routes.submissions.submit(grantSubmissionId)
              }
              method="POST"
            >
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
                  readOnly={hasSubmissionBeenSubmitted}
                />
              ))}

              <h1 className="govuk-heading-s" data-cy="cy-download-header">
                Download a copy of your application
              </h1>
              <p className="govuk-body">
                You can{' '}
                <a
                  className="govuk-link govuk-link--no-visited-state"
                  style={{ pointerEvents: 'none' }}
                  href={`/apply/applicant/api/routes/submissions/${grantSubmissionId}/download-summary`}
                >
                  download a copy of your answers (Odt)
                </a>{' '}
                for future reference.
              </p>

              {hasSubmissionBeenSubmitted ? (
                <div className="govuk-button-group">
                  <a
                    href={`${publicRuntimeConfig.subPath}/applications`}
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--secondary"
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
                      className="govuk-button"
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

export const QuestionRow = ({ question, readOnly }) => {
  const { questionId, fieldTitle, multiResponse, responseType, response } =
    question;
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{fieldTitle}</dt>
      {multiResponse ? (
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
            href={''}
            id={`change-button-${questionId}`}
            style={{ pointerEvents: 'none' }}
          >
            <a
              className="govuk-link govuk-link--no-visited-state"
              data-cy={`cy-section-details-navigation-${questionId}`}
              style={{ pointerEvents: 'none' }}
            >
              {response || multiResponse ? 'Change' : 'Add'}
            </a>
          </Link>
        </dd>
      )}
    </div>
  );
};
