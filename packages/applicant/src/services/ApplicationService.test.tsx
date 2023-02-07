import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getConfig from 'next/config';
import { getApplicationsListById } from './ApplicationService';
jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});
const { serverRuntimeConfig } = getConfig();
const BACKEND_HOST = serverRuntimeConfig.backendHost;
const applicantId = '12345678';
const getApplicantByIdUrl = `${BACKEND_HOST}/submissions`;

const MockApplicationsData = [
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: '1y6stfoa',
    applicationName: 'Application 1',
    submissionStatus: 'IN_PROGRESS',
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
];
describe('Axios call to get application list data', () => {
  it('should get applications list data', async () => {
    const spy = jest.spyOn(axios, 'get');
    const mock = new MockAdapter(axios);
    mock.onGet(getApplicantByIdUrl).reply(200, MockApplicationsData);
    const result = await getApplicationsListById('testJwt');
    expect(result).toEqual(MockApplicationsData);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(getApplicantByIdUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
