import { NextApiRequest } from 'next';
import { APIGlobalHandler } from './apiErrorHandler';
import { logger } from './logger';

jest.mock('./logger', () => ({
  logger: {
    error: jest.fn(),
    utils: { addErrorInfo: (err) => err },
  },
}));

const mockReq = {} as NextApiRequest;
const mockRes = {
  redirect: jest.fn(),
} as any;

describe('APIGlobalHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call the handler function successfully', async () => {
    const mockHandler = jest.fn();

    await APIGlobalHandler(mockReq, mockRes, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);

    expect(logger.error).not.toHaveBeenCalled();
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  it('should handle an error and redirect on failure', async () => {
    const expectedError = new Error('Test error');
    const mockHandler = jest.fn(() => {
      throw expectedError;
    });

    await APIGlobalHandler(mockReq, mockRes, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(logger.error).toHaveBeenCalledWith(
      logger.utils.addErrorInfo(expectedError, mockReq)
    );
    expect(mockRes.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/service-error?serviceErrorProps=')
    );
  });
});
