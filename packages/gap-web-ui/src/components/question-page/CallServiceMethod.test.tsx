import callServiceMethod from './CallServiceMethod';
import { parseBody } from 'next/dist/server/api-utils/node';
import { GetServerSidePropsContext } from 'next';

jest.mock('next/dist/server/api-utils/node', () => ({
  parseBody: jest.fn(),
}));
jest.mock('csurf', () => {
  return {
    __esModule: true,
    default:
      () =>
      (
        req: GetServerSidePropsContext['req'],
        res: GetServerSidePropsContext['res'],
        callback: (...args: any) => any
      ) => {
        callback({});
      },
  };
});

type ServiceError = {
  errorInformation: string;
  linkAttributes?: {
    href: string;
    linkText: string;
    linkInformation: string;
  };
};

describe('callServiceMethod', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to the provided url when the call was successful', async () => {
    (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = 'testDestination';
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    const result = await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(result).toEqual({
      redirect: {
        destination: redirectTo,
        statusCode: 302,
      },
    });
  });

  it('redirects to the returned url when a redirectTo method is provided', async () => {
    (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    const result = await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(result).toEqual({
      redirect: {
        destination: 'testDestination',
        statusCode: 302,
      },
    });
  });

  it('calls redirectTo method with service method response', async () => {
    (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(redirectTo).toHaveBeenCalledTimes(1);
    expect(redirectTo).toHaveBeenCalledWith({ testResponse: true });
  });

  it('calls service method with response from parseBody', async () => {
    (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(serviceFunc).toHaveBeenCalledTimes(1);
    expect(serviceFunc).toHaveBeenCalledWith({ testBody: true });
  });

  it('calls parseBody with provided req object', async () => {
    (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(parseBody).toHaveBeenCalledTimes(1);
    expect(parseBody).toHaveBeenCalledWith(
      { testReq: true, method: 'POST' },
      '1mb'
    );
  });

  it('removes carriage returns from strings in body', async () => {
    (parseBody as jest.Mock).mockResolvedValue({
      testBody: 'first line\r\nsecond line\r\nthird line',
    });
    const serviceFunc = jest.fn(() => Promise.resolve({ testResponse: true }));
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(serviceFunc).toHaveBeenCalledTimes(1);
    expect(serviceFunc).toHaveBeenCalledWith({
      testBody: 'first line\nsecond line\nthird line',
    });
  });

  it('redirects to an error page if an error is thrown', async () => {
    (parseBody as jest.Mock).mockResolvedValue({
      testBody: true,
    });
    const serviceFunc = jest.fn(() => {
      throw new Error('test error');
    });
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    const result = await callServiceMethod(req, res, serviceFunc, redirectTo, {
      errorInformation: 'something happened',
    } as ServiceError);

    expect(result).toEqual({
      redirect: {
        destination:
          '/service-error?serviceErrorProps={"errorInformation":"something happened"}',
        statusCode: 302,
      },
    });
  });

  it('returns the request body with validation errors if errors are returned by service method', async () => {
    (parseBody as jest.Mock).mockResolvedValue({
      testBody: true,
    });
    const serviceFunc = jest.fn(() => {
      const err = new Error('test error');
      (err as any).response = {
        data: {
          fieldErrors: 'testFieldErrors',
        },
      };
      throw err;
    });
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    const result = await callServiceMethod(
      req,
      res,
      serviceFunc,
      redirectTo,
      {} as ServiceError
    );

    expect(result).toEqual({
      body: { testBody: true },
      fieldErrors: 'testFieldErrors',
    });
  });
});
