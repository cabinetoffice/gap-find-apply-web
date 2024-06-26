import { axios } from '../utils/axios';

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
