import {
  buildQueryStringWithoutUndefinedValues,
  downloadFile,
  validateRedirectUrl,
} from './general';

describe('downloadFile', () => {
  it('Should download the file', () => {
    const link = {
      download: '',
      href: '',
      click: jest.fn(),
    };

    jest
      .spyOn(document, 'createElement')
      .mockImplementation(() => link as unknown as HTMLElement);

    downloadFile('fileName', '#');

    expect(link.download).toStrictEqual('#');
    expect(link.href).toStrictEqual('fileName');
    expect(link.click).toHaveBeenCalledTimes(1);
  });
});

describe('validateRedirectUrl', () => {
  process.env.FIND_A_GRANT_URL = 'https://findagrantservice.com';

  it('should validate correct url', () => {
    const response = validateRedirectUrl(
      'https://www.findagrantservice.com/some-path/sub-path'
    );
    expect(response).toBeUndefined();
  });

  it('should validate correct url when given a relative path', () => {
    const response = validateRedirectUrl('/some-path/sub-path');
    expect(response).toBeUndefined();
  });

  it('should throw an error when on the wrong host', () => {
    const invalidPath =
      'https://www.not-the-realfindagrantservice.com/some-path/sub-path';
    expect(() => validateRedirectUrl(invalidPath)).toThrowError();
  });
});

describe('buildQueryStringWithoutUndefinedValues', () => {
  it('strips undefined', () => {
    const input = {
      a: '1',
      b: undefined,
      c: null,
      d: 'something',
    };
    const expectedResult = '?a=1&c=null&d=something';
    expect(buildQueryStringWithoutUndefinedValues(input)).toStrictEqual(
      expectedResult
    );
  });
  it('returns empty string if no values', () => {
    const input = {};
    expect(buildQueryStringWithoutUndefinedValues(input)).toStrictEqual('');
  });
  it('returns empty string if all values are undefined', () => {
    const input = {
      a: undefined,
      b: undefined,
      c: undefined,
    };
    expect(buildQueryStringWithoutUndefinedValues(input)).toStrictEqual('');
  });
});
