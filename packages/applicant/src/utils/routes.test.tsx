export {};
import { routes } from './routes';
describe('Submission.sections', () => {
  test('should create the right sections url', () => {
    const url = routes.submissions.sections('grantSubmissionId');
    expect(url).toBe(`/submissions/grantSubmissionId/sections`);
  });
});
describe('Submission.section', () => {
  test('should create the right section url', () => {
    const url = routes.submissions.section('grantSubmissionId', 'sectionId');
    expect(url).toBe(`/submissions/grantSubmissionId/sections/sectionId`);
  });
});
describe('Submissions.question', () => {
  test('should create the right section url', () => {
    const url = routes.submissions.question(
      'grantSubmissionId',
      'sectionId',
      'questionId'
    );
    expect(url).toBe(
      `/submissions/grantSubmissionId/sections/sectionId/questions/questionId`
    );
  });
});
describe('Submissions.submissionConfirmation', () => {
  test('should create the right section url', () => {
    const url = routes.submissions.submissionConfirmation('grantSubmissionId');
    expect(url).toBe(`/submissions/grantSubmissionId/submission-confirmation`);
  });
});
describe('Api.submissions.section', () => {
  test('should create the right section url', () => {
    const url = routes.api.submissions.section(
      'grantSubmissionId',
      'sectionId'
    );
    expect(url).toBe(`/api/submissions/grantSubmissionId/sections/sectionId`);
  });
});
describe('Api.submissions.question', () => {
  test('should create the right section url', () => {
    const url = routes.api.submissions.question(
      'grantSubmissionId',
      'sectionId',
      'questionId'
    );
    expect(url).toBe(
      `/api/submissions/grantSubmissionId/sections/sectionId/questions/questionId`
    );
  });
});
describe('Api.createMandatoryQuestion', () => {
  test('should create the right section url', () => {
    const schemeId = 'schemeId';
    const expectedURL = `/api/create-mandatory-question?schemeId=${schemeId}`;
    expect(routes.api.createMandatoryQuestion(schemeId)).toBe(expectedURL);
  });
});

describe('Api.getApplicationForm', () => {
  const mandatoryQuestionId = 'mandatoryQuestionId';
  const expectedURL = `/api/get-application-form?mandatoryQuestionId=${mandatoryQuestionId}`;
  expect(routes.api.getApplicationForm(mandatoryQuestionId)).toBe(expectedURL);
});
describe('Mandatory Questions Routes', () => {
  it('should generate the correct start page URL', () => {
    const schemeId = 'exampleSchemeId';
    const expectedURL = `/mandatory-questions/start?schemeId=${schemeId}`;
    expect(routes.mandatoryQuestions.startPage(schemeId)).toBe(expectedURL);
  });

  it('should generate the correct name page URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-name`;
    expect(routes.mandatoryQuestions.namePage(mandatoryQuestionId)).toBe(
      expectedURL
    );
  });

  it('should generate the correct address page URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-address`;
    expect(routes.mandatoryQuestions.addressPage(mandatoryQuestionId)).toBe(
      expectedURL
    );
  });

  it('should generate the correct type page URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-type`;
    expect(routes.mandatoryQuestions.typePage(mandatoryQuestionId)).toBe(
      expectedURL
    );
  });

  it('should generate the correct companiesHouseNumberPage URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-companies-house-number`;
    expect(
      routes.mandatoryQuestions.companiesHouseNumberPage(mandatoryQuestionId)
    ).toBe(expectedURL);
  });

  it('should generate the correct charityCommissionNumberPage URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-charity-commission-number`;
    expect(
      routes.mandatoryQuestions.charityCommissionNumberPage(mandatoryQuestionId)
    ).toBe(expectedURL);
  });

  it('should generate the correct fundingAmountPage URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-funding-amount`;
    expect(
      routes.mandatoryQuestions.fundingAmountPage(mandatoryQuestionId)
    ).toBe(expectedURL);
  });

  it('should generate the correct fundingLocationPage URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-funding-location`;
    expect(
      routes.mandatoryQuestions.fundingLocationPage(mandatoryQuestionId)
    ).toBe(expectedURL);
  });

  it('should generate the correct summary page URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/organisation-summary`;
    expect(routes.mandatoryQuestions.summaryPage(mandatoryQuestionId)).toBe(
      expectedURL
    );
  });

  it('should generate the correct externalApplication page URL', () => {
    const mandatoryQuestionId = 'exampleMandatoryQuestionId';
    const externalLink = 'exampleExternalLink';
    const expectedURL = `/mandatory-questions/${mandatoryQuestionId}/external-application?externalLink=${externalLink}`;
    expect(
      routes.mandatoryQuestions.externalApplication(
        mandatoryQuestionId,
        externalLink
      )
    ).toBe(expectedURL);
  });
});
