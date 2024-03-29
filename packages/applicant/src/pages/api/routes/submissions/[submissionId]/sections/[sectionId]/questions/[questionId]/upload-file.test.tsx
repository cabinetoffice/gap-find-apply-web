import { getRedirectUrl } from './upload-file.page';
import { routes } from '../../../../../../../../../utils/routes';
import { QuestionNavigation } from '../../../../../../../../../services/SubmissionService';

describe('getRedirectUrl()', () => {
  const testCases = [
    {
      description: 'fromCYAPage is true',
      isFromCYAPage: true,
      isFromSummaryPage: false,
      nextNavParams: null,
      submissionId: 'submissionId',
      sectionId: 'sectionId',
      expectedRedirect: routes.submissions.section('submissionId', 'sectionId'),
    },
    {
      description: 'fromSummaryPage is true',
      isFromCYAPage: false,
      isFromSummaryPage: true,
      nextNavParams: null,
      submissionId: 'submissionId',
      sectionId: 'sectionId',
      expectedRedirect: routes.submissions.summary('submissionId'),
    },
    {
      description: 'neither fromCYAPage nor fromSummaryPage is true',
      isFromCYAPage: false,
      isFromSummaryPage: false,
      nextNavParams: {
        sectionList: false,
        questionId: 'nextQuestionId',
      },
      submissionId: 'submissionId',
      sectionId: 'sectionId',
      expectedRedirect: routes.submissions.question(
        'submissionId',
        'sectionId',
        'nextQuestionId'
      ),
    },
  ];

  it.each(testCases)(
    'should return the correct redirect URL when $description',
    ({
      isFromCYAPage,
      isFromSummaryPage,
      nextNavParams,
      submissionId,
      sectionId,
      expectedRedirect,
    }) => {
      const redirectUrl = getRedirectUrl({
        isFromCYAPage,
        isFromSummaryPage,
        nextNavParams: nextNavParams as QuestionNavigation,
        submissionId,
        sectionId,
      });

      expect(redirectUrl).toBe(expectedRedirect);
    }
  );
});
