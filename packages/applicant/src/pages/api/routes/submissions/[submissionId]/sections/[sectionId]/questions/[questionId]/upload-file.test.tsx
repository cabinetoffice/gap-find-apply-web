/**
 * @jest-environment node
 */
import http from 'http';
import { AddressInfo } from 'net';
import handler, {
  FILE_TOO_LARGE_ERROR_MESSAGE,
  getRedirectUrl,
} from './upload-file.page';
import { routes } from '../../../../../../../../../utils/routes';
import {
  getQuestionById,
  postDocumentResponse,
  QuestionNavigation,
} from '../../../../../../../../../services/SubmissionService';
import { logger } from '../../../../../../../../../utils/logger';

jest.mock('../../../../../../../../../utils/constants', () => ({
  ...jest.requireActual('../../../../../../../../../utils/constants'),
  MAX_FILE_UPLOAD_SIZE_BYTES: 1024,
}));
jest.mock('../../../../../../../../../services/SubmissionService', () => ({
  ...jest.requireActual(
    '../../../../../../../../../services/SubmissionService'
  ),
  getQuestionById: jest.fn(),
  postDocumentResponse: jest.fn(),
  getNextNavigation: jest.fn(),
}));
jest.mock('../../../../../../../../../utils/jwt', () => ({
  getJwtFromCookies: () => 'jwt',
}));
jest.mock('../../../../../../../../../utils/logger', () => ({
  logger: {
    error: jest.fn(),
    utils: { addErrorInfo: (err) => err },
  },
}));

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

describe('upload-file handler', () => {
  const submissionId = 'sub-1';
  const sectionId = 'sec-1';
  const questionId = 'q-1';
  const questionUrl = `${process.env.HOST}${routes.submissions.question(
    submissionId,
    sectionId,
    questionId
  )}`;
  const BOUNDARY = 'testboundary';

  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    // Run the real handler behind a real HTTP server so formidable parses an
    // actual request stream, with the shims Next.js adds to `res`.
    server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      Object.assign(req, { query: Object.fromEntries(url.searchParams) });
      Object.assign(res, {
        redirect: (status: number, location: string) => {
          res.writeHead(status, { Location: location });
          res.end();
          return res;
        },
        status: (status: number) => {
          res.statusCode = status;
          return res;
        },
        json: (body: unknown) => res.end(JSON.stringify(body)),
      });
      handler(req, res);
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => new Promise((resolve) => server.close(resolve)));

  beforeEach(() => {
    jest.clearAllMocks();
    (getQuestionById as jest.Mock).mockResolvedValue({
      question: { validation: { mandatory: true }, response: null },
    });
  });

  const multipartBody = (fileSizeBytes: number) =>
    Buffer.concat([
      Buffer.from(
        `--${BOUNDARY}\r\n` +
          'Content-Disposition: form-data; name="attachment"; filename="doc.pdf"\r\n' +
          'Content-Type: application/pdf\r\n\r\n'
      ),
      Buffer.alloc(fileSizeBytes, 'a'),
      Buffer.from(`\r\n--${BOUNDARY}--\r\n`),
    ]);

  const post = ({
    body,
    contentType = `multipart/form-data; boundary=${BOUNDARY}`,
    referer = questionUrl,
  }: {
    body: Buffer;
    contentType?: string;
    referer?: string;
  }) =>
    new Promise<{ status: number; location: string }>((resolve, reject) => {
      const req = http.request(
        {
          port,
          method: 'POST',
          path: `/?submissionId=${submissionId}&sectionId=${sectionId}&questionId=${questionId}`,
          headers: {
            'Content-Type': contentType,
            'Content-Length': body.length,
            Referer: referer,
          },
        },
        (res) => {
          res.resume();
          resolve({ status: res.statusCode, location: res.headers.location });
        }
      );
      req.on('error', reject);
      req.end(body);
    });

  const errorsInLocation = (location: string) =>
    new URL(location).searchParams
      .getAll('errors[]')
      .map((error) => JSON.parse(error));

  describe('when the file is larger than the maximum size', () => {
    it('redirects back to the question with a file size error', async () => {
      const { status, location } = await post({ body: multipartBody(4096) });

      expect(status).toBe(302);
      expect(location.startsWith(questionUrl)).toBe(true);
      expect(errorsInLocation(location)).toEqual([
        { fieldName: questionId, errorMessage: FILE_TOO_LARGE_ERROR_MESSAGE },
      ]);
    });

    it('keeps the user on the check your answers journey', async () => {
      const { location } = await post({
        body: multipartBody(4096),
        referer: `${questionUrl}?fromCYAPage=true`,
      });

      expect(location.endsWith('&fromCYAPage=true')).toBe(true);
    });

    it('does not send the file to the backend', async () => {
      await post({ body: multipartBody(4096) });

      expect(postDocumentResponse).not.toHaveBeenCalled();
    });

    it('does not log an error', async () => {
      await post({ body: multipartBody(4096) });

      expect(logger.error).not.toHaveBeenCalled();
    });
  });

  it('redirects to the service error page when the upload cannot be read', async () => {
    const { status, location } = await post({
      body: multipartBody(10),
      contentType: 'multipart/form-data',
    });

    expect(status).toBe(302);
    expect(location).toContain('/service-error');
    expect(logger.error).toHaveBeenCalled();
    expect(postDocumentResponse).not.toHaveBeenCalled();
  });

  it('redirects back to the question with the backend validation errors', async () => {
    (postDocumentResponse as jest.Mock).mockRejectedValue({
      response: {
        data: { errors: [{ errorMessage: 'The file type is not allowed' }] },
      },
    });

    const { status, location } = await post({ body: multipartBody(10) });

    expect(status).toBe(302);
    expect(location.startsWith(questionUrl)).toBe(true);
    expect(errorsInLocation(location)).toEqual([
      { fieldName: questionId, errorMessage: 'The file type is not allowed' },
    ]);
  });

  it('redirects to the service error page when the backend fails for another reason', async () => {
    (postDocumentResponse as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { status, location } = await post({ body: multipartBody(10) });

    expect(status).toBe(302);
    expect(location).toContain('/service-error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('redirects to the next question when the upload succeeds', async () => {
    (postDocumentResponse as jest.Mock).mockResolvedValue({
      nextNavigation: { sectionList: false, questionId: 'q-2' },
    });

    const { status, location } = await post({ body: multipartBody(10) });

    expect(status).toBe(302);
    expect(location).toBe(
      `${process.env.HOST}${routes.submissions.question(
        submissionId,
        sectionId,
        'q-2'
      )}`
    );
  });
});
