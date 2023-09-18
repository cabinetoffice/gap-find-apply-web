export {};
import { routes } from './routes';
describe('Submission.sections', () => {
  test('should create the right sections url', () => {
    const url = routes.submissions.sections('grantSubmissionId');
    expect(url).toBe(`/submissions/grantSubmissionId/sections`);
  });

  test('should create the right sections url when migrationStatus is set', () => {
    const url = routes.submissions.sections('grantSubmissionId', 'success');
    expect(url).toBe(
      `/submissions/grantSubmissionId/sections?migrationStatus=success`
    );
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
