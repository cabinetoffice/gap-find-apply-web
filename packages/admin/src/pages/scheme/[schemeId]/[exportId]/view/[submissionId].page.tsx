import { GetServerSidePropsContext } from 'next';
import { getLoggedInUsersDetails } from '../../../../../services/UserService';
import { getSubmissionBySubmissionId } from '../../../../../services/SubmissionsService';
import InferProps from '../../../../../types/InferProps';
import { generateErrorPageRedirect } from '../../../../../utils/serviceErrorHelpers';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import CustomLink from '../../../../../components/custom-link/CustomLink';
import Meta from '../../../../../components/layout/Meta';
import { QuestionRow } from './QuestionRow.component';
import { SectionData } from '../../../../../types/SubmissionSummary';
export const getServerSideProps = async ({
  req,
  res,
  query,
}: GetServerSidePropsContext) => {
  const { schemeId } = query as Record<string, string>;
  const { submissionId } = query as Record<string, string>;

  const errorPageRedirect = generateErrorPageRedirect(
    'Something went wrong.',
    req.headers.referer ? req.headers.referer : '/dashboard',
    !!req.headers.referer
  );

  let userDetails, submission, sessionCookie;

  try {
    sessionCookie = await getSessionIdFromCookies(req);
    userDetails = await getLoggedInUsersDetails(sessionCookie);
    submission = await getSubmissionBySubmissionId(submissionId, sessionCookie);
  } catch (error) {
    return errorPageRedirect;
  }

  return {
    props: {
      backButtonHref: `/scheme/${schemeId}/download-submissions`,
      csrfToken: res.getHeader('x-csrf-token') as string,
      userDetails,
      submission,
    },
  };
};

const SubmissionSummary = ({
  backButtonHref,
  userDetails,
  submission,
}: InferProps<typeof getServerSideProps>) => {
  return (
    <>
      <Meta title={`View application - Manage a grant`} />

      <CustomLink href={backButtonHref} isBackButton />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <span
            className="govuk-caption-l"
            data-cy={`cy-application-name-${submission.schemeName}`}
          >
            {submission.schemeName}
          </span>
          <h1 className="govuk-heading-l" data-cy="cy-page-header">
            {userDetails.organisationName}
          </h1>
          {submission.sections.map((section: SectionData) => {
            return (
              <div
                className="govuk-summary-card"
                key={`section-card-${section.sectionId}`}
              >
                <div className="govuk-summary-card__title-wrapper">
                  <h2 className="govuk-summary-card__title">
                    {section.sectionTitle}
                  </h2>
                </div>
                <div className="govuk-summary-card__content">
                  <dl className="govuk-summary-list">
                    {section.questions.map((question) => {
                      return (
                        <QuestionRow
                          key={`question-${question.questionId}`}
                          {...question}
                        />
                      );
                    })}
                  </dl>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SubmissionSummary;
