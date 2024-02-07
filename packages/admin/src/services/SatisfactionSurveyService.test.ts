import axios from 'axios';
import getConfig from 'next/config';
import { postSurveyResponse } from './SatisfactionSurveyService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_FEEDBACK_URL = BACKEND_HOST + '/feedback';

describe('SatisfactionSurveyService', () => {
  describe('Send feedback', () => {
    it('Should successfully send full feedback', async () => {
      const mockPost = jest.fn();
      mockedAxios.post.mockImplementation(mockPost);
      await postSurveyResponse(
        '5',
        'satisfied',
        'testSessionId',
        BASE_FEEDBACK_URL,
        'advert'
      );

      expect(mockPost).toHaveBeenCalledWith(BASE_FEEDBACK_URL, null, {
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
        params: {
          comment: 'satisfied',
          journey: 'advert',
          satisfaction: '5',
        },
      });
    });

    it('Should successfully send just a satisfaction score', async () => {
      const mockPost = jest.fn();
      mockedAxios.post.mockImplementation(mockPost);
      await postSurveyResponse(
        '5',
        '',
        'testSessionId',
        BASE_FEEDBACK_URL,
        'advert'
      );

      expect(mockPost).toHaveBeenCalledWith(BASE_FEEDBACK_URL, null, {
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
        params: {
          comment: '',
          journey: 'advert',
          satisfaction: '5',
        },
      });
    });

    it('Should successfully send just a comment', async () => {
      const mockPost = jest.fn();
      mockedAxios.post.mockImplementation(mockPost);
      await postSurveyResponse(
        '',
        'I am satisfied',
        'testSessionId',
        BASE_FEEDBACK_URL,
        'advert'
      );

      expect(mockPost).toHaveBeenCalledWith(BASE_FEEDBACK_URL, null, {
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
        params: {
          comment: 'I am satisfied',
          journey: 'advert',
          satisfaction: '',
        },
      });
    });

    it('Should not send without a satisfaction score or comment', async () => {
      const mockPost = jest.fn();
      mockedAxios.post.mockImplementation(mockPost);

      await postSurveyResponse(
        '',
        '',
        'testSessionId',
        BASE_FEEDBACK_URL,
        'advert'
      );

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });
});
