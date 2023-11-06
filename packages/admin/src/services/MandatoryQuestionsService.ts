import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_SUBMISSIONS_URL = process.env.BACKEND_HOST + '/mandatory-questions';

const spotlightExport = async (sessionCookie: string, schemeId: string) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/spotlight-export/${schemeId}`,
    {
      withCredentials: true,
      responseType: 'arraybuffer',
      headers: {
        Cookie: `SESSION=${sessionCookie};`,
      },
    }
  );
  return response;
};

const completedMandatoryQuestions = async (
  schemeId: string,
  sessionCookie: string
) => {
  const response = await axios.get(
    `${BASE_SUBMISSIONS_URL}/does-scheme-have-completed-mandatory-questions/${schemeId}`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export { completedMandatoryQuestions, spotlightExport };
