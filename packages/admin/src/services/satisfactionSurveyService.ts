import axios from 'axios';
import getConfig from 'next/config';
import { axiosSessionConfig } from '../utils/session';

// TODO: Why is this not populating?
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const BASE_FEEDBACK_URL = BACKEND_HOST + '/feedback';

const postSurveyResponse = async (
  satisfaction: string,
  comment: string,
  sessionId: string,
  backendUrl: string,
  userJourney: string
) => {
  if (!satisfaction && comment === '') {
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
      satisfaction: satisfaction,
      comment: comment,
      journey: userJourney,
    };

    // `${BASE_FEEDBACK_URL}/add`
    await axios.post(backendUrl, null, {
      params: surveyResponse,
      ...axiosSessionConfig(sessionId),
    });
  }
};

export { postSurveyResponse };
