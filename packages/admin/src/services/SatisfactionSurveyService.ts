import axios from 'axios';
import getConfig from 'next/config';

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
  if (satisfaction || comment !== '') {
    const surveyResponse = {
      satisfaction: satisfaction,
      comment: comment,
      journey: userJourney,
    };

    await axios.post(backendUrl, null, {
      withCredentials: true,
      headers: {
        Cookie: `SESSION=${sessionId};`,
      },
      params: surveyResponse,
    });
  }
};

export { postSurveyResponse };
