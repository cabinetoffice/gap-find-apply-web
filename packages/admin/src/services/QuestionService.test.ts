import axios from 'axios';
import ResponseTypeEnum from '../enums/ResponseType';
import {
  deleteQuestion,
  getQuestion,
  patchQuestion,
  postQuestion,
} from './QuestionService';
import getConfig from 'next/config';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/application-forms';
const SESSION_ID = 'TestSession';
const APPLICATION_ID = 'TestApp';
const SECTION_ID = 'TestSection';
const QUESTION_ID = 'TestQuestion';

describe('QuestionService', () => {
  describe('patchQuestion', () => {
    it('Should update a question', async () => {
      mockedAxios.patch.mockResolvedValue({});

      await patchQuestion(SESSION_ID, APPLICATION_ID, SECTION_ID, QUESTION_ID, {
        displayText: 'test display text',
      });

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/questions/${QUESTION_ID}`,
        {
          displayText: 'test display text',
        },
        { headers: { Cookie: 'SESSION=TestSession;' }, withCredentials: true }
      );
    });
  });

  describe('postQuestion', () => {
    it('Should post a question', async () => {
      mockedAxios.post.mockResolvedValue({});

      await postQuestion(SESSION_ID, APPLICATION_ID, SECTION_ID, {
        fieldTitle: 'Test question title',
        responseType: ResponseTypeEnum.ShortAnswer,
        validation: { mandatory: true },
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/questions`,
        {
          fieldTitle: 'Test question title',
          responseType: 'ShortAnswer',
          validation: { mandatory: true },
        },
        { headers: { Cookie: 'SESSION=TestSession;' }, withCredentials: true }
      );
    });
  });

  describe('getQuestion', () => {
    const sampleQuestion = {
      questionId: 'testQuestionId',
      fieldTitle: 'Test field title',
      hintText: 'Test description of a question',
      responseType: 'ShortAnswer',
      validation: { mandatory: true },
    };

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({ data: sampleQuestion });
    });

    it('Should fetch a question', async () => {
      await getQuestion(SESSION_ID, APPLICATION_ID, SECTION_ID, QUESTION_ID);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/questions/${QUESTION_ID}`,
        { headers: { Cookie: 'SESSION=TestSession;' }, withCredentials: true }
      );
    });

    it('Should return the fetched question', async () => {
      const response = await getQuestion(
        SESSION_ID,
        APPLICATION_ID,
        SECTION_ID,
        QUESTION_ID
      );

      expect(response).toStrictEqual(sampleQuestion);
    });
  });

  describe('deleteQuestion', () => {
    it('Should delete a question', async () => {
      mockedAxios.delete.mockResolvedValue({});

      await deleteQuestion(SESSION_ID, APPLICATION_ID, SECTION_ID, QUESTION_ID);

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_APPLICATION_URL}/${APPLICATION_ID}/sections/${SECTION_ID}/questions/${QUESTION_ID}`,
        { headers: { Cookie: 'SESSION=TestSession;' }, withCredentials: true }
      );
    });
  });
});
