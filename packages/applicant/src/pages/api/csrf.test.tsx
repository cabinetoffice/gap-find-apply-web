import { NextApiRequest, NextApiResponse } from 'next';
import csrfHandler from './csrf.page';

const mockCsrfSecret = 'csrfSecret';

function mockSecretsManagerClient() {
  return {
    send() {
      return { SecretString: JSON.stringify({ csrfSecret: mockCsrfSecret }) };
    },
  };
}

jest.mock('@aws-sdk/client-secrets-manager', () => {
  return {
    ...jest.requireActual('@aws-sdk/client-secrets-manager'),
    SecretsManagerClient: mockSecretsManagerClient,
  };
});

jest.mock('../../utils/constants', () => ({
  IS_PRODUCTION: true,
}));

const getResponse = (overrides = {}) =>
  ({
    redirect: jest.fn(),
    status: jest.fn(function () {
      return this;
    }),
    json: jest.fn(function () {
      return this;
    }),
    ...overrides,
  } as unknown as NextApiResponse);

describe('/api/csrf', () => {
  it('responds with 200 and expected payload to request from expected local address', async () => {
    const req = {
      headers: { host: 'localhost:3000', 'x-forwarded-for': '::1' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ secret: mockCsrfSecret });
  });

  it('responds 404 when host header not localhost:3000', async () => {
    const req = {
      headers: { host: 'https://www.google.com', 'x-forwarded-for': '::1' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('responds 404 when x-forwarded-for header not ::1', async () => {
    const req = {
      headers: { host: 'localhost:3000', 'x-forwarded-for': '1.2.3.4' },
    } as unknown as NextApiRequest;

    const res = getResponse();

    await csrfHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
