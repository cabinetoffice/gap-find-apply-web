import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_SCHEMES_URL = process.env.BACKEND_HOST + '/schemes';

export async function removeEditor(
  sessionCookie: string,
  schemeId: string,
  editorId: string
) {
  await axios.delete(
    `${BASE_SCHEMES_URL}/${schemeId}/editors/${editorId}`,
    axiosSessionConfig(sessionCookie)
  );
}

export async function getSchemeEditors(
  schemeId: string,
  sessionId: string,
  userServiceJwt: string
): Promise<
  {
    id: string;
    email: string;
  }[]
> {
  const response = await axios.get(`${BASE_SCHEMES_URL}/${schemeId}/editors`, {
    withCredentials: true,
    headers: {
      Cookie: `SESSION=${sessionId}; ${process.env.JWT_COOKIE_NAME}=${userServiceJwt}`,
    },
  });
  return response.data;
}
