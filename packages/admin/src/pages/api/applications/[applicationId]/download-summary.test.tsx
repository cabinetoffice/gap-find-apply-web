import { NextApiRequest, NextApiResponse } from 'next';
import { AxiosResponse } from 'axios';
import handler from './download-summary.page';
import {
  downloadSummary,
  getApplicationFormSummary,
} from '../../../../services/ApplicationService';
import { ApplicationFormSummary } from '../../../../types/ApplicationForm';
import { getSessionIdFromCookies } from '../../../../utils/session';

jest.mock('../../../../utils/axios');
jest.mock('../../../../utils/session');
const mockGetSessionIdFromCookies = jest.mocked(getSessionIdFromCookies);
jest.mock('next/config', () => () => ({
  serverRuntimeConfig: {
    backendHost: 'http://localhost:1',
  },
}));
jest.mock('../../../../services/ApplicationService');
const mockGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);
const mockDownloadSummary = jest.mocked(downloadSummary);

describe('Next API Handler', () => {
  it('should handle the request and send the file', async () => {
    const applicationId = 'exampleApplicationId';
    const sessionId = 'exampleSessionId';

    mockGetSessionIdFromCookies.mockReturnValue(sessionId);

    mockDownloadSummary.mockResolvedValue({
      data: 'mocked file data',
    } as AxiosResponse);

    const inputApplicationName =
      'Mock Application Name - 1/1 (With $p£c!&l c#4r@cters./\\{}[]%)';
    const outputApplicationName =
      'Mock_Application_Name_-_1_1_(With__p_c__l_c_4r_cters._______)';
    mockGetApplicationFormSummary.mockResolvedValue({
      applicationName: inputApplicationName,
    } as ApplicationFormSummary);

    const req = {
      query: { applicationId },
    } as unknown as NextApiRequest;

    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as unknown as NextApiResponse;
    await handler(req, res);

    expect(mockDownloadSummary).toHaveBeenCalledWith(applicationId, sessionId);
    expect(mockDownloadSummary).toHaveBeenCalledTimes(1);

    expect(mockGetApplicationFormSummary).toHaveBeenCalledWith(
      applicationId,
      sessionId,
      false,
      false
    );
    expect(mockGetApplicationFormSummary).toHaveBeenCalledTimes(1);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      `attachment; filename=${outputApplicationName}_questions.odt`
    );
    expect(res.setHeader).toHaveBeenCalledTimes(2);

    expect(res.send).toHaveBeenCalledWith(
      Buffer.from('mocked file data', 'binary')
    );
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});
