import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_URL = process.env.USER_SERVICE_HOST + '/spadmin';

const getAllRoles = async (sessionCookie: string) => {
  const response = await axios.get(`${BASE_URL}/get-all-roles`, axiosSessionConfig(sessionCookie));
  return response.data;
};

export { getAllRoles };
