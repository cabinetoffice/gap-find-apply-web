import { NextApiRequest } from 'next';
import { APIGlobalHandler } from './apiErrorHandler';

const mockReq = {} as NextApiRequest;
const mockRes = {
  redirect: jest.fn(),
} as any;

console.error = jest.fn();

describe('APIGlobalHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call the handler function successfully', async () => {
    const mockHandler = jest.fn();

    await APIGlobalHandler(mockReq, mockRes, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);

    expect(console.error).not.toHaveBeenCalled();
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  it('should handle an error and redirect on failure', async () => {
    const mockHandler = jest.fn(() => {
      throw new Error('Test error');
    });

    await APIGlobalHandler(mockReq, mockRes, mockHandler);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes);
    expect(console.error).toHaveBeenCalledWith(expect.any(Error));
    expect(mockRes.redirect).toHaveBeenCalledWith(
      expect.stringContaining('/service-error?serviceErrorProps=')
    );
  });
});
