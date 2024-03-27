import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { getSessionIdFromCookies } from '../../../utils/session';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { AxiosError } from 'axios';
import CustomError from '../../../types/CustomError';
import { generateErrorPageRedirectV2 } from '../../../utils/serviceErrorHelpers';
import InferProps from '../../../types/InferProps';
import CustomLink from '../../../components/custom-link/CustomLink';
import Meta from '../../../components/layout/Meta';
import { ApplicationFormSection } from '../../../types/ApplicationForm';
import { getGrantScheme } from '../../../services/SchemeService';
import { mapV2Sections } from '../../../utils/applicationSummaryHelper';

export const getServerSideProps = async ({
  req,
  params,
}: GetServerSidePropsContext) => {
  const applicationId = params!.applicationId as string;
  try {
    const { sections, grantSchemeId, applicationName } =
      await getApplicationFormSummary(
        applicationId,
        getSessionIdFromCookies(req)
      );

    const { version } = await getGrantScheme(
      grantSchemeId,
      getSessionIdFromCookies(req)
    );

    let v2SchemeMappedSections;

    if (version !== '1') {
      v2SchemeMappedSections = mapV2Sections(sections);
    }

    return {
      props: {
        applicationId,
        sections: v2SchemeMappedSections ?? sections,
        applicationName,
      },
    };
  } catch (err) {
    console.error('Error rendering section overview -> ', err);
    const error = err as AxiosError;
    const errorMessageObject = error.response?.data as CustomError;

    return generateErrorPageRedirectV2(
      errorMessageObject.code,
      `/build-application/${applicationId}/dashboard`
    );
  }
};

export default function SectionOverview({
  applicationId,
  sections,
  applicationName,
}: InferProps<typeof getServerSideProps>) {
  const backButtonHref = '/build-application/' + applicationId + '/preview';
  return (
    <>
      <Meta title="Application builder - Section overview" />
      <CustomLink href={backButtonHref} isBackButton />
      <div className="govuk-grid-row govuk-!-padding-top-7">
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
                questions={section.questions!}
                {...section}
              />
            ))}
          </ul>
          <Link
            href={backButtonHref}
            className="govuk-button"
            data-cy="cy-back-to-application"
          >
            Back to application form preview
          </Link>
        </div>
      </div>
    </>
  );
}

type SingleSectionProps = {
  sectionId: string;
  sectionTitle: string;
  questions: ApplicationFormSection['questions'];
};

export const SingleSection = ({
  sectionId,
  sectionTitle,
  questions,
}: SingleSectionProps) => {
  const isEligibilitySection = sectionId === 'ELIGIBILITY';
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
        {questions!.map(
          ({ questionId, fieldTitle, questionSuffix, adminSummary }, index) => (
            <SummaryTextListItem
              key={index}
              questionId={questionId}
              fieldTitle={fieldTitle}
              questionSuffix={questionSuffix}
              adminSummary={adminSummary}
              isEligibilitySection={isEligibilitySection}
            />
          )
        )}
      </ul>
    </li>
  );
};

type SummaryTextListItemProps = {
  questionId: string;
  fieldTitle: string;
  questionSuffix: string;
  adminSummary: string;
  isEligibilitySection: boolean;
};

const SummaryTextListItem = ({
  questionId,
  fieldTitle,
  questionSuffix,
  adminSummary,
  isEligibilitySection,
}: SummaryTextListItemProps) => {
  const isAdminSummary = (questionId: string) => {
    const hasAdminSummary = [
      'APPLICANT_ORG_CHARITY_NUMBER',
      'APPLICANT_ORG_COMPANIES_HOUSE',
    ].includes(questionId);

    return hasAdminSummary ? adminSummary : fieldTitle;
  };
  return (
    <li key={`question-${questionId}`}>
      {isEligibilitySection ? questionSuffix : isAdminSummary(questionId)}
    </li>
  );
};
