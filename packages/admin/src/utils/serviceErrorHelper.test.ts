import { generateErrorMessageFromStatusCode } from './serviceErrorHelpers';

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
