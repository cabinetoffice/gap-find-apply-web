import { GetServerSideProps } from 'next';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import Link from 'next/link';
import { getJwtFromCookies } from '../../../utils/jwt';
import { getSubmissionById } from '../../../services/SubmissionService';
import { routes } from '../../../utils/routes';
import { getQuestionById } from '../../../services/SubmissionService';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  params,
}) => {
  const submissionId = params.submissionId.toString();
  const jwt = getJwtFromCookies(req);
  let submission;

  try {
    submission = await getSubmissionById(submissionId, jwt);
  } catch (error) {
    const errorPageParams = {
      errorInformation:
        'Something went wrong while trying to view the application overview.',
      linkAttributes: {
        href: `/submissions/${submissionId}/section-overview`,
        linkText: 'Please return',
        linkInformation: ' and try again.',
      },
    };
    return {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify(
          errorPageParams
        )}`,
        statusCode: 302,
      },
    };
  }
  const { sections, grantSubmissionId, applicationName } = submission;

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

  return {
    props: {
      sections: hydratedSections,
      applicationName,
      grantSubmissionId,
    },
  };
};

export default function SectionOverview({
  sections,
  applicationName,
  grantSubmissionId,
}) {
  console.log(
    sections.map((s) => console.log(`Section: ${s.sectionTitle}: `, s))
  );
  return (
    <>
      <Meta title="My application - Question overview" />
      <Layout backBtnUrl={routes.submissions.sections(grantSubmissionId)}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-l" data-cy="cy-application-name">
              {applicationName}
            </span>
            <h1 className="govuk-heading-l" data-cy="cy-overview-heading">
              Overview of application questions
            </h1>
            <ul className="govuk-list" data-cy="cy-section-list">
              {sections.map((section) => (
                <SingleSection
                  key={`section-${section.sectionId}`}
                  {...section}
                />
              ))}
            </ul>
            <Link
              href={routes.submissions.sections(grantSubmissionId)}
              className="govuk-button"
              data-cy="cy-back-to-application"
            >
              Return to application form
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const SingleSection = ({ sectionId, sectionTitle, questions }) => {
  console.log(
    'questions: ',
    questions.map((q) => q.questionSuffix + q.adminSummary)
  );
  const isEligibility = sectionId === 'ELIGIBILITY';
  const isAdminSummary = (questionId: string) => {
    return [
      'APPLICANT_ORG_CHARITY_NUMBER',
      'APPLICANT_ORG_COMPANIES_HOUSE',
    ].includes(questionId);
  };

  return (
    <li key={`section-${sectionId}`}>
      <h2 className="govuk-heading-m">{sectionTitle}</h2>
      <p className="govuk-body" data-cy="cy-will-be-asked">
        In this section, you will be asked:
      </p>
      <ul
        className="govuk-list--bullet govuk-!-padding-bottom-3"
        data-cy="cy-question-list"
      >
        {questions.map(
          ({ questionId, fieldTitle, questionSuffix, adminSummary }) => {
            return (
              <li key={`question-${questionId}`}>
                {isEligibility
                  ? questionSuffix
                  : isAdminSummary(questionId)
                  ? adminSummary
                  : fieldTitle}
              </li>
            );
          }
        )}
      </ul>
    </li>
  );
};
