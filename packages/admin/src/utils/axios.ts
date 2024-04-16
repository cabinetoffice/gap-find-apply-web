import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosStatic,
} from 'axios';
import { v4 } from 'uuid';
import { logger } from './logger';
import { HEADERS } from './constants';

const requestInterceptor = (request: InternalAxiosRequestConfig) => {
  request.headers[HEADERS.CORRELATION_ID] = v4();
  logger.http('Outgoing request', request);
  return request;
};

const responseInterceptor = (response: AxiosResponse) => {
  const { request: _, ...propertiesToLog } = response;
  logger.http('Incoming response', propertiesToLog);
  return response;
};

const configureAxios = (axios: AxiosStatic | AxiosInstance) => {
  axios.interceptors.request.use(requestInterceptor);
  axios.interceptors.response.use(responseInterceptor);
};

const client = axios.create();
configureAxios(axios);
configureAxios(client);

export { axios, client };
