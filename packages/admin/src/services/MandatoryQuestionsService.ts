import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_MANDATORY_QUESTIONS_URL =
  process.env.BACKEND_HOST + '/mandatory-questions';

const downloadDueDiligenceData = async (
  sessionCookie: string,
  schemeId: string
) => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/due-diligence/${schemeId}`,
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

const spotlightExport = async (sessionCookie: string, schemeId: string) => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/spotlight-export/${schemeId}`,
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
): Promise<boolean> => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/scheme/${schemeId}/complete`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

const hasSpotlightData = async (
  schemeId: string,
  sessionCookie: string
): Promise<boolean> => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/scheme/${schemeId}/spotlight-complete`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export {
  completedMandatoryQuestions,
  downloadDueDiligenceData,
  hasSpotlightData,
  // eslint-disable-next-line prettier/prettier
  spotlightExport
};
