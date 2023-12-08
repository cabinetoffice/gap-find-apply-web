import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_MANDATORY_QUESTIONS_URL =
  process.env.BACKEND_HOST + '/mandatory-questions';

const downloadDueDiligenceData = async (
  sessionCookie: string,
  schemeId: string,
  internal: string
) => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/due-diligence/${schemeId}?isInternal=${internal}`,
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

const hasCompletedMandatoryQuestions = async (
  schemeId: string,
  sessionCookie: string,
  isInternal: boolean
): Promise<boolean> => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/scheme/${schemeId}/isCompleted?isInternal=${isInternal}`,
    axiosSessionConfig(sessionCookie)
  );
  return response.data;
};

export {
  hasCompletedMandatoryQuestions,
  downloadDueDiligenceData,
  spotlightExport,
};
