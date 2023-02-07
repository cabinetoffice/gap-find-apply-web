import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getConfig from 'next/config';
import { axiosConfig } from '../utils/jwt';
import {
  createSubmission,
  deleteAttachmentByQuestionId,
  getNextNavigation,
  getQuestionById,
  getSectionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  isSubmissionReady,
  NextNavigation,
  postDocumentResponse,
  postHasSectionBeenCompleted,
  postQuestionResponse,
  PostQuestionResponse,
  QuestionData,
  QuestionPostBody,
  QuestionType,
  SectionData,
  SectionReviewBody,
  submit,
} from './SubmissionService';

jest.mock('../utils/jwt');
jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
  };
});

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;

const submissionId = '1234';
const sectionId = '5678';
const questionId = '98765';
const applicationId = '1';
const attachmentId = 'attachmentId';
const getSubmissionDataByUrl = `${BACKEND_HOST}/submissions/${submissionId}`;
const getSectionByIdUrl = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}`;
const postHasSectionBeenCompletedUrl = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/review`;
const getQuestionByIdUrl = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`;
const createSubmissionURL = `${BACKEND_HOST}/submissions/createSubmission/${applicationId}`;
const MockCreateSubmissionData = [
  {
    submissionCreated: 'string',
    submissionId: '1',
    message: 'string',
  },
];
const getIsApplicationReadyByUrl = `${BACKEND_HOST}/submissions/${submissionId}/ready`;
const getHasSubmissionBeenSubmittedUrl = `${BACKEND_HOST}/submissions/${submissionId}/isSubmitted`;
const postSubmitUrl = `${BACKEND_HOST}/submissions/submit`;
const postDocumentResponseUrl = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/attach`;
const deleteDocumentUrl = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/attachments/${attachmentId}`;
const getNextNavigationUrlSaveAndExitFalse = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/next-navigation`;
const getNextNavigationUrlSaveAndExitTrue = `${BACKEND_HOST}/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}/next-navigation?saveAndExit=true`;
const mockAxiosConfig = {
  headers: { Authorization: 'Bearer testJwt', Accept: 'application/json' },
};

describe('Submission service ', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSectionsForSubmissionById', () => {
    it('should get organisation data through axios', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      (axiosConfig as jest.Mock).mockReturnValue(mockAxiosConfig);

      const MockSubmissionData = {
        grantSchemeId: 'string',
        grantApplicationId: 'string',
        grantSubmissionId: 'string',
        applicationName: 'Name of the grant being applied for',
        submissionStatus: 'IN_PROGRESS',
        sections: [
          {
            sectionId: 'ESSENTIAL',
            sectionTitle: 'Essential Information',
            sectionStatus: 'COMPLETE',
            questionIds: [
              'APPLICANT_TYPE',
              'APPLICANT_ORG_NAME',
              'APPLICANT_ORG_ADDRESS',
              'APPLICANT_ORG_COMPANIES_HOUSE',
              'APPLICANT_ORG_COMPANIES_HOUSE',
              'APPLICANT_AMOUNT',
            ],
          },
          {
            sectionId: 'Non ESSENTIAL',
            sectionTitle: 'Non Essential Information',
            sectionStatus: 'INCOMPLETE',
            questionIds: [
              'APPLICANT_TYPE',
              'APPLICANT_ORG_NAME',
              'APPLICANT_ORG_ADDRESS',
              'APPLICANT_ORG_COMPANIES_HOUSE',
              'APPLICANT_ORG_COMPANIES_HOUSE',
              'APPLICANT_AMOUNT',
            ],
          },
        ],
      };
      mock.onGet(getSubmissionDataByUrl).reply(200, MockSubmissionData);

      const result = await getSubmissionById(submissionId, 'testJwt');

      expect(result).toEqual(MockSubmissionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(getSubmissionDataByUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('getQuestionById', () => {
    test('should get question data', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const mockQuestionData: QuestionData = {
        grantSchemeId: '1',
        grantApplicationId: '1',
        grantSubmissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
        sectionId: 'CUSTOM_SECTION_1',
        sectionTitle: 'Project Information',
        question: {
          questionId: 'CUSTOM_QUESTION_1',
          profileField: null,
          fieldTitle:
            'Description of the project, please include information regarding public accessibility (see GOV.UK guidance for a definition of public access) to the newly planted trees',
          displayText: null,
          hintText: null,
          questionSuffix: null,
          responseType: 'LongAnswer',
          validation: {
            mandatory: true,
            minLength: 100,
            maxLength: 2000,
          },
          response: null,
        },
        nextNavigation: {
          sectionId: 'CUSTOM_SECTION_1',
          questionId: 'CUSTOM_QUESTION_2',
        },
        previousNavigation: null,
      };
      mock.onGet(getQuestionByIdUrl).reply(200, mockQuestionData);
      const result = await getQuestionById(
        submissionId,
        sectionId,
        questionId,
        'testJwt'
      );
      expect(result).toEqual(mockQuestionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(getQuestionByIdUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('getSectionById', () => {
    test('should get section data', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const shortAnswer: QuestionType = {
        questionId: 'APPLICANT_ORG_NAME',
        profileField: 'ORG_NAME',
        fieldTitle: 'Enter the name of your organisation',
        hintText:
          'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
        responseType: 'ShortAnswer',
        validation: {
          mandatory: true,
          minLength: 5,
          maxLength: 100,
        },
      };
      const mockSectionData: SectionData = {
        sectionId: 'ESSENTIAL',
        sectionTitle: 'Essential Information',
        sectionStatus: 'COMPLETED',
        questions: [shortAnswer],
      };
      mock.onGet(getSectionByIdUrl).reply(200, mockSectionData);
      const result = await getSectionById(submissionId, sectionId, 'testJwt');

      expect(result).toEqual(mockSectionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(getSectionByIdUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('postQuestionResponse', () => {
    test('no Error', async () => {
      const spy = jest.spyOn(axios, 'post');
      const mock = new MockAdapter(axios);
      const mockBody: QuestionPostBody = {
        response: 'mockedResponse',
        submissionId,
        questionId,
      };
      const mockPostResponse: PostQuestionResponse = {
        responseAccepted: true,
        nextNavigation: {
          sectionId: 'ESSENTIAL',
          questionId: 'APPLICANT_TYPE',
        },
      };
      mock.onPost(getQuestionByIdUrl, mockBody).reply(200, mockPostResponse);
      const result = await postQuestionResponse(
        submissionId,
        sectionId,
        questionId,
        mockBody,
        'testJwt'
      );
      expect(result).toEqual(mockPostResponse);
      expect(spy).toBeCalled();
      expect(spy).toHaveBeenCalledWith(
        getQuestionByIdUrl,
        expect.objectContaining(mockBody),
        {
          headers: {
            Authorization: `Bearer testJwt`,
            Accept: 'application/json',
          },
        }
      );
    });
  });

  describe('isSubmissionReady', () => {
    test('should return true or false', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const expectedResult = true;
      (axiosConfig as jest.Mock).mockReturnValue(mockAxiosConfig);

      mock.onGet(getIsApplicationReadyByUrl).reply(200, expectedResult);

      const result = await isSubmissionReady(submissionId, 'testJwt');

      expect(result).toEqual(expectedResult);
      expect(spy).toBeCalledWith(getIsApplicationReadyByUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('hasSubmissionBeenSubmitted', () => {
    test('should return true or false', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const expectedResult = true;
      (axiosConfig as jest.Mock).mockReturnValue(mockAxiosConfig);

      mock.onGet(getHasSubmissionBeenSubmittedUrl).reply(200, expectedResult);

      const result = await hasSubmissionBeenSubmitted(submissionId, 'testJwt');

      expect(result).toEqual(expectedResult);
      expect(spy).toBeCalledWith(getHasSubmissionBeenSubmittedUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('submit application', () => {
    test('should successfully submit the application', async () => {
      const spy = jest.spyOn(axios, 'post');
      const mock = new MockAdapter(axios);
      const expectedResult: string = 'Submitted';
      const postBody = {
        submissionId,
      };

      mock.onPost(postSubmitUrl, postBody).reply(200, expectedResult);

      const result = await submit(submissionId, 'testJwt');

      expect(result).toEqual(expectedResult);
      expect(spy).toBeCalledWith(
        postSubmitUrl,
        expect.objectContaining(postBody),
        {
          headers: {
            Authorization: `Bearer testJwt`,
            Accept: 'application/json',
          },
        }
      );
    });
  });
  describe('createSubmission', () => {
    test('axios post call to create submission', async () => {
      (axiosConfig as jest.Mock).mockReturnValue(mockAxiosConfig);

      const spy = jest.spyOn(axios, 'post');
      const mock = new MockAdapter(axios);
      mock.onPost(createSubmissionURL).reply(200, MockCreateSubmissionData);
      const result = await createSubmission(applicationId, 'testJwt');
      expect(result).toEqual(MockCreateSubmissionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(createSubmissionURL, '1', {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('postDocumentResponse', () => {
    test('no Error', async () => {
      const spy = jest.spyOn(axios, 'post');
      const mock = new MockAdapter(axios);

      const mockPostResponse: PostQuestionResponse = {
        responseAccepted: true,
        nextNavigation: {
          sectionId: 'ESSENTIAL',
          questionId: 'APPLICANT_TYPE',
        },
      };
      mock.onPost(postDocumentResponseUrl).reply(200, mockPostResponse);
      const result = await postDocumentResponse(
        submissionId,
        sectionId,
        questionId,
        'testFile',
        'testFileName',
        'testJwt'
      );
      expect(result).toEqual(mockPostResponse);
      expect(spy).toBeCalled();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteAttachmentByQuestionId', () => {
    test('should deleteAttachment', async () => {
      const spy = jest.spyOn(axios, 'delete');
      const mock = new MockAdapter(axios);
      const mockQuestionData: QuestionData = {
        grantSchemeId: '1',
        grantApplicationId: '1',
        grantSubmissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
        sectionId: 'CUSTOM_SECTION_1',
        sectionTitle: 'Project Information',
        question: {
          questionId: 'CUSTOM_QUESTION_1',
          profileField: null,
          fieldTitle:
            'Description of the project, please include information regarding public accessibility (see GOV.UK guidance for a definition of public access) to the newly planted trees',
          displayText: null,
          hintText: null,
          questionSuffix: null,
          responseType: 'LongAnswer',
          validation: {
            mandatory: true,
            minLength: 100,
            maxLength: 2000,
          },
          response: null,
        },
        nextNavigation: {
          sectionId: 'CUSTOM_SECTION_1',
          questionId: 'CUSTOM_QUESTION_2',
        },
        previousNavigation: null,
      };
      mock.onDelete(deleteDocumentUrl).reply(200, mockQuestionData);
      const result = await deleteAttachmentByQuestionId(
        submissionId,
        sectionId,
        questionId,
        'attachmentId',
        'testJwt'
      );
      expect(result).toEqual(mockQuestionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(deleteDocumentUrl, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });

  describe('getNextNavigation', () => {
    test('should getNextNavigation save and exit=false', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const mockQuestionData: NextNavigation = {
        nextNavigation: {
          sectionId: 'sectionId',
          questionId: 'questionId',
        },
      };
      mock
        .onGet(getNextNavigationUrlSaveAndExitFalse)
        .reply(200, mockQuestionData);
      const result = await getNextNavigation(
        submissionId,
        sectionId,
        questionId,
        false,
        'testJwt'
      );
      expect(result).toEqual(mockQuestionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(getNextNavigationUrlSaveAndExitFalse, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });

    test('should getNextNavigation save and exit=true', async () => {
      const spy = jest.spyOn(axios, 'get');
      const mock = new MockAdapter(axios);
      const mockQuestionData: NextNavigation = {
        nextNavigation: {
          sectionId: 'sectionId',
          questionId: 'questionId',
          sectionList: true,
        },
      };
      mock
        .onGet(getNextNavigationUrlSaveAndExitTrue)
        .reply(200, mockQuestionData);
      const result = await getNextNavigation(
        submissionId,
        sectionId,
        questionId,
        true,
        'testJwt'
      );
      expect(result).toEqual(mockQuestionData);
      expect(spy).toBeCalled();
      expect(spy).toBeCalledWith(getNextNavigationUrlSaveAndExitTrue, {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      });
    });
  });
});

describe('postDocumentResponse', () => {
  test('no Error', async () => {
    const spy = jest.spyOn(axios, 'post');
    const mock = new MockAdapter(axios);

    const mockPostResponse: PostQuestionResponse = {
      responseAccepted: true,
      nextNavigation: {
        sectionId: 'ESSENTIAL',
        questionId: 'APPLICANT_TYPE',
      },
    };
    //TODO mock formData and pass it as a body
    mock.onPost(postDocumentResponseUrl).reply(200, mockPostResponse);
    const result = await postDocumentResponse(
      submissionId,
      sectionId,
      questionId,
      'testFile',
      'testFileName',
      'testJwt'
    );

    expect(result).toEqual(mockPostResponse);
    expect(spy).toBeCalled();
    //TODO add expect(spy).toHaveBeenCalledWith
  });
});

describe('deleteAttachmentByQuestionId', () => {
  test('should deleteAttachment', async () => {
    const spy = jest.spyOn(axios, 'delete');
    const mock = new MockAdapter(axios);
    const mockQuestionData: QuestionData = {
      grantSchemeId: '1',
      grantApplicationId: '1',
      grantSubmissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
      sectionId: 'CUSTOM_SECTION_1',
      sectionTitle: 'Project Information',
      question: {
        questionId: 'CUSTOM_QUESTION_1',
        profileField: null,
        fieldTitle:
          'Description of the project, please include information regarding public accessibility (see GOV.UK guidance for a definition of public access) to the newly planted trees',
        displayText: null,
        hintText: null,
        questionSuffix: null,
        responseType: 'LongAnswer',
        validation: {
          mandatory: true,
          minLength: 100,
          maxLength: 2000,
        },
        response: null,
      },
      nextNavigation: {
        sectionId: 'CUSTOM_SECTION_1',
        questionId: 'CUSTOM_QUESTION_2',
      },
      previousNavigation: null,
    };
    mock.onDelete(deleteDocumentUrl).reply(200, mockQuestionData);
    const result = await deleteAttachmentByQuestionId(
      submissionId,
      sectionId,
      questionId,
      'attachmentId',
      'testJwt'
    );
    expect(result).toEqual(mockQuestionData);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(deleteDocumentUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});

describe('getNextNavigation', () => {
  test('should getNextNavigation save and exit=false', async () => {
    const spy = jest.spyOn(axios, 'get');
    const mock = new MockAdapter(axios);
    const mockQuestionData: NextNavigation = {
      nextNavigation: {
        sectionId: 'sectionId',
        questionId: 'questionId',
      },
    };
    mock
      .onGet(getNextNavigationUrlSaveAndExitFalse)
      .reply(200, mockQuestionData);
    const result = await getNextNavigation(
      submissionId,
      sectionId,
      questionId,
      false,
      'testJwt'
    );
    expect(result).toEqual(mockQuestionData);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(getNextNavigationUrlSaveAndExitFalse, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });

  test('should getNextNavigation save and exit=true', async () => {
    const spy = jest.spyOn(axios, 'get');
    const mock = new MockAdapter(axios);
    const mockQuestionData: NextNavigation = {
      nextNavigation: {
        sectionId: 'sectionId',
        questionId: 'questionId',
        sectionList: true,
      },
    };
    mock
      .onGet(getNextNavigationUrlSaveAndExitTrue)
      .reply(200, mockQuestionData);
    const result = await getNextNavigation(
      submissionId,
      sectionId,
      questionId,
      true,
      'testJwt'
    );
    expect(result).toEqual(mockQuestionData);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(getNextNavigationUrlSaveAndExitTrue, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});

describe('postHasSectionBeenCompleted', () => {
  test('no Error', async () => {
    const spy = jest.spyOn(axios, 'post');
    const mock = new MockAdapter(axios);
    const mockBody: SectionReviewBody = {
      isComplete: true,
    };
    const mockPostResponse: string =
      'Section with ID 5678 status has been updated to COMPLETED.';
    mock
      .onPost(postHasSectionBeenCompletedUrl, mockBody)
      .reply(200, mockPostResponse);
    const result = await postHasSectionBeenCompleted(
      submissionId,
      sectionId,
      mockBody,
      'testJwt'
    );
    expect(result).toEqual(mockPostResponse);
    expect(spy).toBeCalled();
    expect(spy).toHaveBeenCalledWith(
      postHasSectionBeenCompletedUrl,
      expect.objectContaining(mockBody),
      {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      }
    );
  });
});

describe('postHasSectionBeenCompleted', () => {
  test('no Error', async () => {
    const spy = jest.spyOn(axios, 'post');
    const mock = new MockAdapter(axios);
    const mockBody: SectionReviewBody = {
      isComplete: true,
    };
    const mockPostResponse: string =
      'Section with ID 5678 status has been updated to COMPLETED.';
    mock
      .onPost(postHasSectionBeenCompletedUrl, mockBody)
      .reply(200, mockPostResponse);
    const result = await postHasSectionBeenCompleted(
      submissionId,
      sectionId,
      mockBody,
      'testJwt'
    );
    expect(result).toEqual(mockPostResponse);
    expect(spy).toBeCalled();
    expect(spy).toHaveBeenCalledWith(
      postHasSectionBeenCompletedUrl,
      expect.objectContaining(mockBody),
      {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      }
    );
  });
});
