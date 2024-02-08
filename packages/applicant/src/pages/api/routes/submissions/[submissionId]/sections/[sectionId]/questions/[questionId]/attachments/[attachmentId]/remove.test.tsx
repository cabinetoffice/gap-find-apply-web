import handler from './remove.page'; // Update the path accordingly
import { routes } from '../../../../../../../../../../../utils/routes';
import { deleteAttachmentByQuestionId } from '../../../../../../../../../../../services/SubmissionService';

jest.mock('../../../../../../../../../../../services/SubmissionService');
jest.mock('../../../../../../../../../../../utils/jwt', () => ({
  getJwtFromCookies: () => 'jwt',
}));

describe('handler', () => {
  const testCases = [
    {
      description: 'without query string',
      query: {},
      expectedQueryString: '',
    },
    {
      description: 'with fromCYAPage query string',
      query: { fromCYAPage: true },
      expectedQueryString: '?fromCYAPage=true',
    },
    {
      description: 'with fromSubmissionSummaryPage query string',
      query: { fromSubmissionSummaryPage: true },
      expectedQueryString: '?fromSubmissionSummaryPage=true',
    },
  ];

  test.each(testCases)(
    'should call deleteAttachmentByQuestionId and redirect %s',
    async ({ query, expectedQueryString }) => {
      const req = {
        query: {
          submissionId: 'submissionId',
          sectionId: 'sectionId',
          questionId: 'questionId',
          attachmentId: 'attachmentId',
          ...query,
        },
        headers: {
          referer: 'http://localhost:3000' + expectedQueryString,
        },
      };
      const res = {
        redirect: jest.fn(),
      };
      await handler(req, res);

      expect(deleteAttachmentByQuestionId).toHaveBeenCalledWith(
        'submissionId',
        'sectionId',
        'questionId',
        'attachmentId',
        'jwt'
      );
      expect(res.redirect).toHaveBeenCalledWith(
        302,
        `${process.env.HOST}${routes.submissions.question(
          'submissionId',
          'sectionId',
          'questionId'
        )}${expectedQueryString}`
      );
    }
  );
});
