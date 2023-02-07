import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { axiosConfig, getJwtFromCookies } from './jwt';
// eslint-disable-next-line @next/next/no-server-import-in-page
import cookieParser from 'cookie-parser';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

jest.mock('cookie', () => ({
  parse: () => {
    return { 'connect.sid': 'something' };
  },
}));

describe('getJwtFromCookies', () => {
  test('should not throw an error', () => {
    const cookieParserSpy = jest.spyOn(cookieParser, 'signedCookie');
    cookieParserSpy.mockReturnValue('unsignedCookie');
    const req = {
      cookies: { cooKey: 'cooValue' },
    } as unknown as
      | (IncomingMessage & { cookies: NextApiRequestCookies })
      | NextApiRequest;
    const expectedResult = 'unsignedCookie';
    const result = getJwtFromCookies(req);
    expect(result).toBe(expectedResult);
  });

  test('should throw an error', () => {
    const cookieParserSpy = jest.spyOn(cookieParser, 'signedCookie');
    cookieParserSpy.mockReturnValue('');
    const req = {
      cookies: { cooKey: 'cooValue' },
    } as unknown as
      | (IncomingMessage & { cookies: NextApiRequestCookies })
      | NextApiRequest;

    expect(() => {
      getJwtFromCookies(req);
    }).toThrowError();
  });
});

describe('axiosConfig', () => {
  test('should return headers with bearer token', () => {
    const token = 'testToken';
    const result = axiosConfig(token);
    expect(result).toStrictEqual({
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });
  });
});
