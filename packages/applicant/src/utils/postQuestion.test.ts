import { parseBody } from './parseBody';
import { QuestionPostBody } from '../services/SubmissionService';
import postQuestion, {
  CleanedBody,
  convertAddressFieldNameFromErrors,
  convertDateFieldNameFromErrors,
  createRequestBody,
  fieldsStartingWithQuestionIdInBody,
} from './postQuestion';
import { routes } from './routes';

jest.mock('./parseBody');

const mockParseBody = jest.mocked(parseBody);

const submissionId = 'submissionId';
const sectionId = 'sectionId';
const questionId = 'questionId';
const questionType = 'ShortAnswer';
describe('callServiceMethod', () => {
  describe('no Error Cases', () => {
    it('redirects to the Check Your Answer Page when cancel is in the body', async () => {
      const req = {
        test: 'commission',
        cancel: '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
          nextNavigation: { sectionId: 'sectionId', questionId: 'questionId' },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.section(submissionId, sectionId),
          statusCode: 302,
        },
      });
    });
    it('redirects to the next question page when the call was successful and save and continue is in the body and the referer is not checkYourAnswerPage', async () => {
      const req = {
        test: 'commission',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
          nextNavigation: { sectionId: 'sectionId', questionId: 'questionId' },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.question(
            submissionId,
            sectionId,
            questionId
          ),
          statusCode: 302,
        },
      });
    });

    it('redirects to the checkYourAnswer page when the call was successful, save and continue is in the body, but no next question is available', async () => {
      const req = {
        test: 'commission',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
          nextNavigation: { sectionList: true, questionId, sectionId },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.section(submissionId, sectionId),
          statusCode: 302,
        },
      });
    });
    it('redirects to the checkYourAnswer page  when the call was successful and save and continue is in the body and the referer is checkYourAnswerPage', async () => {
      const req = {
        test: 'commission',
        'save-and-continue': '',
        isRefererCheckYourAnswerScreen: '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
          nextNavigation: { sectionId: 'sectionId', questionId: 'questionId' },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.section(submissionId, sectionId),
          statusCode: 302,
        },
      });
    });
    it('redirects to the checkYourAnswer page  when the call was successful and save and continue is in the body and there is no nextNavigation in the backend response', async () => {
      const req = {
        test: 'commission',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.section(submissionId, sectionId),
          statusCode: 302,
        },
      });
    });

    it('redirects to the section list when the call was successful and save and exit is in the body', async () => {
      const req = {
        test: 'commission',
        'save-and-exit': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
          nextNavigation: { sectionId: 'sectionId', questionId: 'questionId' },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.sections(submissionId),
          statusCode: 302,
        },
      });
    });

    it('redirects to the submission summary page when the call was successful, fromSummarySubmissionPage is true and ELIGIBILITY is Yes', async () => {
      const req = {
        ELIGIBILITY: 'Yes',
        'save-and-continue': '',
      } as any;
      (parseBody as jest.Mock).mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        true
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.summary(submissionId),
          statusCode: 302,
        },
      });
    });

    it('redirects to the submission summary page when the call was successful, fromSummarySubmissionPage is true and ELIGIBILITY is not present', async () => {
      const req = {
        FUNDING: 'Yes please',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        true
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.summary(submissionId),
          statusCode: 302,
        },
      });
    });

    it('redirects to the section list page when the call was successful and fromSummarySubmissionPage is true but ELIGIBILITY is No', async () => {
      const req = {
        ELIGIBILITY: 'No',
        'save-and-exit': '',
      } as any;
      (parseBody as jest.Mock).mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.resolve({
          responseAccepted: true,
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        true
      );

      expect(result).toEqual({
        redirect: {
          destination: routes.submissions.sections(submissionId),
          statusCode: 302,
        },
      });
    });
  });
  describe('with Errors', () => {
    it('create correct Validation error__single error', async () => {
      const req = {
        test: 'commission',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.reject({
          response: {
            data: {
              responseAccepted: false,
              message: 'Validation failure',
              errors: [
                {
                  fieldName: 'response',
                  errorMessage: 'You must enter an answer',
                },
              ],
              invalidData: {
                submissionId,
                questionId,
                response: '',
                multiResponse: null,
              },
            },
          },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        questionId,
        questionType,
        false
      );

      expect(result).toEqual({
        body: req,
        fieldErrors: [
          {
            errorMessage: 'You must enter an answer',
            fieldName: 'questionId',
          },
        ],
        isRefererCheckYourAnswerScreen: false,
        values: [],
      });
    });

    it('create correct Validation error__Address error', async () => {
      const req = {
        'CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1': '',
        'CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2': '',
        'CUSTOM_APPLICANT_ORG_ADDRESS-town': '',
        'CUSTOM_APPLICANT_ORG_ADDRESS-county': '',
        'CUSTOM_APPLICANT_ORG_ADDRESS-postcode': '',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.reject({
          response: {
            data: {
              responseAccepted: false,
              message: 'Validation failure',
              errors: [
                {
                  fieldName: 'multiResponse[4]',
                  errorMessage: 'You must enter an answer',
                },
                {
                  fieldName: 'multiResponse[0]',
                  errorMessage: 'You must enter an answer',
                },
                {
                  fieldName: 'multiResponse[2]',
                  errorMessage: 'You must enter an answer',
                },
              ],
              invalidData: {
                submissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
                questionId: 'CUSTOM_APPLICANT_ORG_ADDRESS',
                response: null,
                multiResponse: ['', '', '', '', ''],
              },
            },
          },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        'CUSTOM_APPLICANT_ORG_ADDRESS',
        'AddressInput',
        false
      );

      expect(result).toEqual({
        body: req,
        fieldErrors: [
          {
            fieldName: 'CUSTOM_APPLICANT_ORG_ADDRESS-postcode',
            errorMessage: 'You must enter an answer',
          },
          {
            fieldName: 'CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1',
            errorMessage: 'You must enter an answer',
          },
          {
            fieldName: 'CUSTOM_APPLICANT_ORG_ADDRESS-town',
            errorMessage: 'You must enter an answer',
          },
        ],
        isRefererCheckYourAnswerScreen: false,
        values: ['', '', '', '', ''],
      });
    });

    it('create correct Validation error__Date error', async () => {
      const req = {
        'CUSTOM_CUSTOM_QUESTION_4-day': '',
        'CUSTOM_CUSTOM_QUESTION_4-month': '',
        'CUSTOM_CUSTOM_QUESTION_4-year': '',
        'save-and-continue': '',
      } as any;
      mockParseBody.mockResolvedValue(req);
      const serviceFunc = jest.fn(() =>
        Promise.reject({
          response: {
            data: {
              responseAccepted: false,
              message: 'Validation failure',
              errors: [
                {
                  fieldName: 'multiResponse',
                  errorMessage: 'You must enter a date',
                },
              ],
              invalidData: {
                submissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
                questionId: 'CUSTOM_CUSTOM_QUESTION_4',
                response: null,
                multiResponse: ['', '', ''],
              },
            },
          },
        })
      );

      const result = await postQuestion(
        req,
        {},
        serviceFunc,
        submissionId,
        sectionId,
        'CUSTOM_CUSTOM_QUESTION_4',
        'Date',
        false
      );

      expect(result).toEqual({
        body: req,
        fieldErrors: [
          {
            fieldName: 'CUSTOM_CUSTOM_QUESTION_4-date',
            errorMessage: 'You must enter a date',
          },
        ],
        isRefererCheckYourAnswerScreen: false,
        values: ['', '', ''],
      });
    });
  });
});

describe('createRequestBody', () => {
  test('should return a requestBody with Response when the body contain a single response', () => {
    const body = {
      test: 'saddsasda',
      'save-and-continue': '',
    };
    const questionId = 'test';
    const submissionId = 'testSubmission';
    const questionType = 'questionType';
    const result = createRequestBody(
      body,
      questionId,
      submissionId,
      questionType,
      false
    );
    const expectedResult: QuestionPostBody = {
      response: 'saddsasda',
      submissionId,
      questionId,
      multiResponse: null,
      shouldUpdateSectionStatus: true,
    };
    expect(result).toStrictEqual(expectedResult);
  });

  test('should return a requestBody with Response as null, and multiResponse filled with values when the body contain multiple key value pair', () => {
    const body = {
      'test-address-line-1': 'fsa',
      'test-address-line-2': '',
      'test-town': 'fsa',
      'test-county': '',
      'test-postcode': 'fsaasf',
      'save-and-continue': '',
    };
    const questionId = 'test';
    const submissionId = 'testSubmission';
    const questionType = 'questionType';
    const result = createRequestBody(
      body,
      questionId,
      submissionId,
      questionType,
      false
    );
    const expectedResult: QuestionPostBody = {
      response: null,
      submissionId,
      questionId,
      multiResponse: ['fsa', '', 'fsa', '', 'fsaasf'],
      shouldUpdateSectionStatus: true,
    };
    expect(result).toStrictEqual(expectedResult);
  });

  test('should return a requestBody with Response as null, and multiResponse filled with values when the body contain a single key value pair, and the value is an Array', () => {
    const body = {
      test: ['test1', 'test2'],
    };
    const questionId = 'test';
    const submissionId = 'testSubmission';
    const questionType = 'questionType';
    const result = createRequestBody(
      body,
      questionId,
      submissionId,
      questionType,
      false
    );
    const expectedResult: QuestionPostBody = {
      response: null,
      submissionId,
      questionId,
      multiResponse: ['test1', 'test2'],
      shouldUpdateSectionStatus: true,
    };
    expect(result).toStrictEqual(expectedResult);
  });

  test('should return a requestBody with Response and multiResponse as null, when the body does not contain accepted keys(key does not pass the regex test)', () => {
    const body = {
      fail: ['test1', 'test2'],
    };
    const questionId = 'test';
    const submissionId = 'testSubmission';
    const result = createRequestBody(
      body,
      questionId,
      submissionId,
      questionType,
      false
    );
    const expectedResult: QuestionPostBody = {
      response: null,
      submissionId,
      questionId,
      multiResponse: null,
      shouldUpdateSectionStatus: true,
    };
    expect(result).toStrictEqual(expectedResult);
  });
});

describe('fieldsStartingWithQuestionIdInBody', () => {
  test('should return an array with only key and value, where the keys in the body match the regex needed', () => {
    const body: CleanedBody = {
      questionIdSomething: 'commission',
      'save-and-continue': '',
    };
    const questionId = 'questionId';
    const result = fieldsStartingWithQuestionIdInBody(body, questionId);
    const expectedResult = [['questionIdSomething', 'commission']];
    expect(result).toStrictEqual(expectedResult);
  });

  test('will return an empty array when the keys in the body do not match the regex needed', () => {
    const body: CleanedBody = {
      questionIdSomething: 'commission',
      'save-and-continue': '',
    };
    const questionId = 'wrongRegex';
    const result = fieldsStartingWithQuestionIdInBody(body, questionId);
    const expectedResult = [];
    expect(result).toStrictEqual(expectedResult);
  });
});

describe('convertAddressFieldNameFromErrors', () => {
  test(`should convert multiResponse[0] to the template literal containing questionId and address-line-1`, () => {
    const errorFieldName = 'multiResponse[0]';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}-address-line-1`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert multiResponse[1] to the template literal containing questionId and address-line-2`, () => {
    const errorFieldName = 'multiResponse[1]';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}-address-line-2`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert multiResponse[2] to the template literal containing questionId and town`, () => {
    const errorFieldName = 'multiResponse[2]';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}-town`;
    expect(result).toStrictEqual(expectedResult);
  });
  test(`should convert multiResponse[3] to the template literal containing questionId and county`, () => {
    const errorFieldName = 'multiResponse[3]';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}-county`;
    expect(result).toStrictEqual(expectedResult);
  });
  test(`should convert multiResponse[4] to the template literal containing questionId and postcode`, () => {
    const errorFieldName = 'multiResponse[4]';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}-postcode`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert anything else to questionId as per default`, () => {
    const errorFieldName = 'test';
    const questionId = 'test';
    const result = convertAddressFieldNameFromErrors(
      errorFieldName,
      questionId
    );
    const expectedResult = `${questionId}`;
    expect(result).toStrictEqual(expectedResult);
  });
});

describe('convertDateFieldNameFromErrors', () => {
  test(`should convert multiResponse[0] to the template literal containing questionId and day`, () => {
    const errorFieldName = 'multiResponse[0]';
    const questionId = 'test';
    const errorMessage = 'bla bla';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}-day`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert multiResponse[1] to the template literal containing questionId and month`, () => {
    const errorFieldName = 'multiResponse[1]';
    const questionId = 'test';
    const errorMessage = 'Blabla';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}-month`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert multiResponse[2] to the template literal containing questionId and year`, () => {
    const errorFieldName = 'multiResponse[2]';
    const questionId = 'test';
    const errorMessage = 'Blabla';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}-year`;
    expect(result).toStrictEqual(expectedResult);
  });
  test(`should convert multiResponse to the template literal containing questionId when errorMessage is not You must enter a date`, () => {
    const errorFieldName = 'multiResponse';
    const questionId = 'test';
    const errorMessage = 'Blabla';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert multiResponse to the template literal containing questionId when errorMessage is not You must enter a date`, () => {
    const errorFieldName = 'multiResponse';
    const questionId = 'test';
    const errorMessage = 'You must enter a date';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}-date`;
    expect(result).toStrictEqual(expectedResult);
  });

  test(`should convert anything else to questionId as per default`, () => {
    const errorFieldName = 'test';
    const questionId = 'test';
    const errorMessage = 'Blabla';
    const result = convertDateFieldNameFromErrors(
      errorFieldName,
      questionId,
      errorMessage
    );
    const expectedResult = `${questionId}`;
    expect(result).toStrictEqual(expectedResult);
  });
});
