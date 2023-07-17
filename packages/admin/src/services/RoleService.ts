import axios from 'axios';
import { axiosSessionConfig } from '../utils/session';

const BASE_URL = process.env.USER_SERVICE_HOST;

const getAllRoles = async (sessionCookie: string) => {
  const response = await axios.get(`${BASE_URL}/role`, axiosSessionConfig(sessionCookie));
  return response.data;
};

export { getAllRoles };
