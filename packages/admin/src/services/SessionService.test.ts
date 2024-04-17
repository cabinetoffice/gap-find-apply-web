import getConfig from 'next/config';
import { axios } from '../utils/axios';
import {
  addFieldsToSession,
  addToSession,
  getSummaryFromSession,
  getValueFromSession,
} from './SessionService';

jest.mock('../utils/axios');

describe('SessionService', () => {
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const BASE_URL = `${BACKEND_HOST}/sessions`;

  describe('addToSession function', () => {
    it('Should add a key value pair to the session when a session exists', async () => {
      mockedAxios.patch.mockResolvedValue({});

      await addToSession(
        'newScheme',
        'fieldName',
        'fieldValue',
        'testSessionId'
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_URL}/add`,
        {},
        {
          params: {
            key: 'newScheme.fieldName',
            value: 'fieldValue',
          },
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });
  });

  describe('addFieldsToSession function', () => {
    beforeEach(() => {
      mockedAxios.patch.mockResolvedValue({
        data: { fieldErrors: [{ name: 'Is required' }] },
        headers: { 'set-cookie': ['SESSION'] },
      });
    });

    it('Should add an object to the session when a session exists', async () => {
      await addFieldsToSession(
        'newScheme',
        {
          fieldName: 'A field name',
          fieldHint: 'A field hint',
        },
        'testSessionId'
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_URL}/batch-add`,
        { fieldHint: 'A field hint', fieldName: 'A field name' },
        {
          params: {
            objectKey: 'newScheme',
          },
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });

    it('Should add an object to the session when a session does NOT exist', async () => {
      await addFieldsToSession(
        'newScheme',
        {
          fieldName: 'A field name',
          fieldHint: 'A field hint',
        },
        'testSessionId'
      );

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${BASE_URL}/batch-add`,
        { fieldHint: 'A field hint', fieldName: 'A field name' },
        {
          params: {
            objectKey: 'newScheme',
          },
          headers: { Cookie: 'SESSION=testSessionId;' },
          withCredentials: true,
        }
      );
    });

    it('Should return the response data', async () => {
      const response = await addFieldsToSession(
        'newScheme',
        {
          fieldName: 'A field name',
          fieldHint: 'A field hint',
        },
        'testSessionId'
      );

      expect(response.data).toStrictEqual({
        fieldErrors: [{ name: 'Is required' }],
      });
    });
  });

  describe('getValueFromSession function', () => {
    it('Should return the field value when the fieldName exists in the session', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { sessionValue: 'fieldValue' },
      });

      const result = await getValueFromSession(
        'newScheme',
        'fieldName',
        'testSessionId'
      );

      expect(result).toEqual('fieldValue');
    });

    it('Should return null when the fieldName does NOT exist in the session', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {},
      });

      const result = await getValueFromSession(
        'newScheme',
        'fieldName',
        'testSessionId'
      );

      expect(result).toEqual(null);
    });
  });

  describe('getSummaryFromSession function', () => {
    it('Should return the object from the users session', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          name: 'mockName',
          description: 'mockDescription',
        },
      });

      const result = await getSummaryFromSession('newScheme', 'testSessionId');

      expect(result).toStrictEqual({
        name: 'mockName',
        description: 'mockDescription',
      });
    });
  });
});
