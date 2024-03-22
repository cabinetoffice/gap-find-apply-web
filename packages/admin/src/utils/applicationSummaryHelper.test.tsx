import {
  ApplicationFormQuestion,
  ApplicationFormSection,
} from '../types/ApplicationForm';
import { mapSingleSection, mapV2Sections } from './applicationSummaryHelper';

describe('Test mapSingleSection', () => {
  const essentialSection = {
    sectionId: 'ESSENTIAL',
    sectionTitle: 'Essential',
    sectionStatus: 'COMPLETE' as const,
    questions: [
      { questionId: 'APPLICANT_TYPE' },
      { questionId: 'APPLICANT_ORG_NAME' },
      { questionId: 'APPLICANT_AMOUNT' },
    ] as ApplicationFormQuestion[],
  };

  it('should map section correctly for ORGANISATION_DETAILS', () => {
    const mappedSection = mapSingleSection(
      essentialSection,
      'ORGANISATION_DETAILS'
    );
    expect(mappedSection.questions).toEqual([
      { questionId: 'APPLICANT_TYPE' },
      { questionId: 'APPLICANT_ORG_NAME' },
    ]);
  });

  it('should map section correctly for FUNDING_DETAILS', () => {
    const mappedSection = mapSingleSection(essentialSection, 'FUNDING_DETAILS');
    expect(mappedSection.questions).toEqual([
      { questionId: 'APPLICANT_AMOUNT' },
    ]);
  });
});

describe('Test mapV2Sections', () => {
  const sections = [
    { sectionId: 'ELIGIBILITY', questions: [] as ApplicationFormQuestion[] },
    { sectionId: 'ESSENTIAL', questions: [] as ApplicationFormQuestion[] },
    { sectionId: 'CUSTOM_SECTION', questions: [] as ApplicationFormQuestion[] },
  ] as ApplicationFormSection[];

  it('should map sections correctly', () => {
    const mappedSections = mapV2Sections(sections);

    expect(mappedSections).toHaveLength(4);
    expect(mappedSections[0].sectionId).toBe('ELIGIBILITY');
    expect(mappedSections[1].sectionId).toBe('ORGANISATION_DETAILS');
    expect(mappedSections[2].sectionId).toBe('FUNDING_DETAILS');
    expect(mappedSections[3].sectionId).toBe('CUSTOM_SECTION');
  });
});
