import { IncomingMessage } from 'http';
import callServiceMethod from './callServiceMethod';
import { parseBody } from './parseBody';
import ServiceError from '../types/ServiceError';
import { NextIncomingMessage } from 'next/dist/server/request-meta';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('./parseBody');

const getMultipleEditorsServiceFunc = (
  applicationId: number,
  message = 'MULTIPLE_EDITORS'
) =>
  jest.fn(() => {
    throw {
      response: {
        data: {
          error: {
            message,
          },
        },
      },
      config: {
        url: `/application-forms/${applicationId}/sectionId`,
      },
    };
  });

describe('callServiceMethod', () => {
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
    expect(parseBody).toHaveBeenCalledWith(req, res);
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

  it('redirects to an Multiple Editors error page if associated error is thrown', async () => {
    (parseBody as jest.Mock).mockResolvedValue({
      testBody: true,
    });
    const applicationId = 123;
    const serviceFunc = getMultipleEditorsServiceFunc(applicationId);
    const redirectTo = jest.fn(() => 'testDestination');
    const req = { testReq: true, method: 'POST' } as any;
    const res = {} as any;

    const result = await callServiceMethod(req, res, serviceFunc, redirectTo, {
      errorInformation: 'something happened',
    } as ServiceError);

    expect(result).toEqual({
      redirect: {
        destination: `/build-application/${applicationId}/error-multiple-editors`,
        statusCode: 302,
      },
    });
  });

  it('redirects to an Multiple Editors with a custom error message', async () => {
    (parseBody as jest.Mock).mockResolvedValue({
      testBody: true,
    });
    const applicationId = 123;

    const serviceFunc = getMultipleEditorsServiceFunc(
      applicationId,
      'MULTIPLE_EDITORS_SECTION_DELETED'
    );

    const redirectTo = jest.fn(() => 'testDestination');
    const req = {
      testReq: true,
      method: 'POST',
    } as unknown as NextApiRequest;
    const res = {} as NextApiResponse;

    const result = await callServiceMethod(req, res, serviceFunc, redirectTo, {
      errorInformation: 'something happened',
    } as ServiceError);

    expect(result).toEqual({
      redirect: {
        destination: `/build-application/${applicationId}/error-multiple-editors?error=The section or question you were editing has been deleted and your changes could not be saved.`,
        statusCode: 302,
      },
    });
  });
});
