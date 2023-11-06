import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getConfig from 'next/config';
import {
  Application,
  getApplicationById,
  getApplicationsListById,
} from './ApplicationService';
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
const getApplicantByIdUrl = `${BACKEND_HOST}/submissions`;
const getApplicationByIdUrl = `${BACKEND_HOST}/grant-application/applicationId`;

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

describe('getApplicationById', () => {
  it('should get application data', async () => {
    const application: Application = {
      id: 1,
      grantScheme: {
        id: 1,
        funderId: 1,
        lastUpdated: 'string',
        lastUpdatedBy: 1,
        ggisIdentifier: 'string',
        name: 'string',
        email: 'string',
        version: 1,
        createdDate: 'string',
      },
      version: 1,
      created: 'string',
      lastUpdated: 'string',
      lastUpdatedBy: 1,
      applicationName: 'string',
      applicationStatus: 'string',
      definition: 'string',
    };
    const spy = jest.spyOn(axios, 'get');
    const mock = new MockAdapter(axios);
    mock.onGet(getApplicationByIdUrl).reply(200, application);
    const result = await getApplicationById('applicationId', 'testJwt');
    expect(result).toEqual(application);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(getApplicationByIdUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
