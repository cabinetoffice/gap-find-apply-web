import {
  ApplicationFormQuestion,
  ApplicationFormSection,
} from '../types/ApplicationForm';

const ORGANISATION_DETAILS = 'ORGANISATION_DETAILS';
const FUNDING_DETAILS = 'FUNDING_DETAILS';

const getOrgDetails = (): ApplicationFormSection => ({
  sectionId: 'ORGANISATION_DETAILS',
  sectionTitle: 'Your details',
  sectionStatus: 'COMPLETE' as const,
  questions: [] as ApplicationFormQuestion[],
});

const getFundingDetails = (): ApplicationFormSection => ({
  sectionId: 'FUNDING_DETAILS',
  sectionTitle: 'Funding',
  sectionStatus: 'COMPLETE' as const,
  questions: [] as ApplicationFormQuestion[],
});

const V2_QUESTION_MAP = {
  [ORGANISATION_DETAILS]: [
    'APPLICANT_TYPE',
    'APPLICANT_ORG_NAME',
    'APPLICANT_ORG_ADDRESS',
    'APPLICANT_ORG_COMPANIES_HOUSE',
    'APPLICANT_ORG_CHARITY_NUMBER',
  ],
  [FUNDING_DETAILS]: ['APPLICANT_AMOUNT', 'BENEFITIARY_LOCATION'],
};

const createV2SchemeSections = (
  sections: ApplicationFormSection[],
  essentialSectionIndex: number
) => {
  const essentialSection = sections[essentialSectionIndex];

  const orgDetails = mapSingleSection(essentialSection, ORGANISATION_DETAILS);
  const fundingDetails = mapSingleSection(essentialSection, FUNDING_DETAILS);

  return { orgDetails, fundingDetails };
};

export const mapSingleSection = (
  essentialSection: ApplicationFormSection,
  requestedSection: typeof ORGANISATION_DETAILS | typeof FUNDING_DETAILS
) => {
  const newSection =
    requestedSection === ORGANISATION_DETAILS
      ? getOrgDetails()
      : getFundingDetails();

  essentialSection.questions!.forEach((question) => {
    if (V2_QUESTION_MAP[requestedSection].includes(question.questionId))
      newSection.questions!.push(question);
  });

  return newSection;
};

export const mapV2Sections = (sections: ApplicationFormSection[]) => {
  const mappedSections = sections;

  const essentialSectionIndex = sections.findIndex(
    (section) => section.sectionId === 'ESSENTIAL'
  );
  const { orgDetails, fundingDetails } = createV2SchemeSections(
    sections,
    essentialSectionIndex
  );

  //Remove the essentials section and replace it with the new sections.
  mappedSections.splice(essentialSectionIndex, 1, orgDetails, fundingDetails);
  return mappedSections;
};
