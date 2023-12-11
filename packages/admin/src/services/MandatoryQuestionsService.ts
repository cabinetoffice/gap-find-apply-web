import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_MANDATORY_QUESTIONS_URL =
  process.env.BACKEND_HOST + '/mandatory-questions';

const downloadAllDueDiligenceData = async (
  sessionCookie: string,
  schemeId: string,
  internal: string
) => {
  const response = await axios.get(
    `${BASE_MANDATORY_QUESTIONS_URL}/scheme/${schemeId}/due-diligence/?isInternal=${internal}`,
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

export { hasCompletedMandatoryQuestions, downloadAllDueDiligenceData };
