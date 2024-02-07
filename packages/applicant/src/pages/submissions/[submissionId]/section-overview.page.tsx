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

  const { sections, grantSubmissionId, applicationName, grantSchemeId } =
    await getSubmissionById(submissionId, jwt);

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
              {sections.map(({ sectionId, sectionTitle, questions }) => {
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
                      {questions.map(({ questionId, fieldTitle }) => {
                        return (
                          <li key={`question-${questionId}`}>{fieldTitle}</li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
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
