import axios from 'axios';
import { FormEvent } from 'react';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

// TODO: Why is this not populating?
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_APPLICATION_URL = BACKEND_HOST + '/feedback';

const postSurveyResponse = async (
  e: FormEvent<HTMLFormElement>,
  sessionId: string,
  backendUrl: string,
  userJourney: string
) => {
  e.preventDefault();

  const formData = new FormData(e.currentTarget);

  if (!formData.get('satisfaction') && formData.get('comment') === '') {
    return await axios.post('#', null, {
      params: {
        fieldErrors: {
          fieldName: 'satisfaction',
          errorMessage: 'Please complete at least one field',
        },
        ...axiosSessionConfig(sessionId),
      },
    });
  } else {
    const surveyResponse = {
      satisfaction: formData.get('satisfaction'),
      comment: formData.get('comment'),
      journey: userJourney,
    };

    // `${BASE_APPLICATION_URL}/add`
    await axios.post(backendUrl, null, {
      params: surveyResponse,
      ...axiosSessionConfig(sessionId),
    });
  }
};

export { postSurveyResponse };
