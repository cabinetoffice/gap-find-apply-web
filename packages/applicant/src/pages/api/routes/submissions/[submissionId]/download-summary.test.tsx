import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import handler from './download-summary.page';

jest.mock('axios');
jest.mock('../../../../../middleware.page');
jest.mock('../../../../../utils/jwt');
jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    backendHost: 'http://localhost:1',
  },
}));

describe('Next API Handler', () => {
  it('should handle the request and send the file', async () => {
    const submissionId = 'exampleSubmissionId';

    (axios.get as jest.Mock).mockResolvedValue({
      data: 'mocked file data',
    });

    const req = {
      query: { submissionId },
    } as unknown as NextApiRequest;

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as NextApiResponse;
    await handler(req, res);

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:1/submissions/${submissionId}/download-summary`,
      { responseType: 'arraybuffer' }
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename=submission.zip'
    );
    expect(res.send).toHaveBeenCalledWith(
      Buffer.from('mocked file data', 'binary')
    );
  });
});
