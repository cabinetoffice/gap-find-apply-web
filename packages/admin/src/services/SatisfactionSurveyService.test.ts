import axios from 'axios';
import getConfig from 'next/config';
import { FormEvent } from 'react';
import { postSurveyResponse } from './SatisfactionSurveyService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_FEEDBACK_URL = BACKEND_HOST + '/feedback';

describe('SatisfactionSurveyService', () => {
  jest.mock('next/config', () => () => {
    return {
      serverRuntimeConfig: {
        backendHost: 'http://localhost:8080',
      },
      publicRuntimeConfig: {
        SUB_PATH: '/feedback',
        APPLICANT_DOMAIN: 'http://localhost:8080',
      },
    };
  });

  jest.mock('axios');
  jest.mock('../services/SatisfactionSurveyService');

  describe('sendFeedback', () => {
    it('Should successfully send full feedback', async () => {
      const mockPost = jest.fn();

      mockedAxios.post.mockImplementation(mockPost);
      postSurveyResponse(
        '5',
        'satisfied',
        'testSessionId',
        'http://localhost:8080/feedback',
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
  });
});
