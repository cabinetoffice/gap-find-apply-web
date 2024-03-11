import {
  generateErrorMessageFromStatusCode,
  generateErrorPageMultipleEditors,
  generateErrorPageParams,
  generateErrorPageRedirect,
  generateErrorPageRedirectV2,
} from './serviceErrorHelpers';

// https://jestjs.io/docs/api#testeachtablename-fn-timeout
describe('generateErrorMessageFromStatusCode', () => {
  test.each`
    code                            | expectedResult
    ${'GRANT_ADVERT_NOT_FOUND'}     | ${'The advert you are trying to access has not been found.'}
    ${'GRANT_SCHEME_NOT_FOUND'}     | ${'The scheme you are trying to access has not been found.'}
    ${'ACCESS_DENIED'}              | ${"You don't have permission to visit this page."}
    ${'WRONG_ARGUMENT_TYPE_PASSED'} | ${'You supplied invalid data to our server.'}
    ${404}                          | ${'Something went wrong when trying to load the page.'}
    ${''}                           | ${'Something went wrong when trying to load the page.'}
    ${'957'}                        | ${'Something went wrong when trying to load the page.'}
  `(
    'given the $code as arguments, returns $expectedResult',
    ({ code, expectedResult }) => {
      expect(generateErrorMessageFromStatusCode(code)).toEqual(expectedResult);
    }
  );
});

describe('generateErrorPage functions', () => {
  const expectedErrorPageParams = {
    errorInformation: 'some info',
    linkAttributes: {
      href: 'some-url',
      linkText: 'Please return',
      linkInformation: ' and try again.',
    },
  };
  test('generateErrorPageParams', () => {
    expect(
      generateErrorPageParams(
        expectedErrorPageParams.errorInformation,
        expectedErrorPageParams.linkAttributes.href
      )
    ).toEqual(expectedErrorPageParams);
  });

  describe('generateErrorPageRedirect', () => {
    test('exclude sub path', () => {
      expect(
        generateErrorPageRedirect(
          expectedErrorPageParams.errorInformation,
          expectedErrorPageParams.linkAttributes.href,
          true
        )
      ).toEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"some info","linkAttributes":{"href":"some-url","linkText":"Please return","linkInformation":" and try again."}}&excludeSubPath=true',
          statusCode: 302,
        },
      });
    });
    test("don't exclude subpath", () => {
      expect(
        generateErrorPageRedirect(
          expectedErrorPageParams.errorInformation,
          expectedErrorPageParams.linkAttributes.href
        )
      ).toEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"some info","linkAttributes":{"href":"some-url","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });
  });

  describe('generateErrorPageRedirectV2', () => {
    test('renders params', () => {
      expect(generateErrorPageRedirectV2('CODE', 'param_string')).toEqual({
        redirect: {
          destination: '/error-page/code/CODE?href=param_string',
          statusCode: 302,
        },
      });
    });
    test('renders link', () => {
      expect(
        generateErrorPageRedirectV2('CODE', expectedErrorPageParams)
      ).toEqual({
        redirect: {
          destination: '/error-page/code/CODE?href=some-url',
          statusCode: 302,
        },
      });
    });
  });

  test('generateErrorPageMultipleEditors', () => {
    expect(generateErrorPageMultipleEditors('appId')).toEqual({
      redirect: {
        statusCode: 302,
        destination: `/build-application/appId/error-multiple-editors`,
      },
    });
  });
});
