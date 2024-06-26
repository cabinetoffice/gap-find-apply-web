import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import getConfig from 'next/config';
import { GrantScheme } from '../types/models/GrantScheme';
import {
  GrantSchemeService,
  MandatoryQuestionApplicationsInfosDto,
} from './GrantSchemeService';

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

describe('Grant scheme service', () => {
  const env = process.env;
  beforeEach(() => {
    process.env = { ...env };
  });
  const spy = jest.spyOn(axios, 'get');
  const mock = new MockAdapter(axios);
  const subject = GrantSchemeService.getInstance();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Get grant scheme by scheme id', async () => {
    const SCHEME_ID = '1';
    const MOCK_GRANT_SCHEME: GrantScheme = {
      id: 1,
      funderId: 1,
      lastUpdated: '2022-08-02 20:10:20-00',
      createdDate: '2022-08-02 20:10:20-00',
      lastUpdatedBy: 1,
      version: 1,
      ggisIdentifier: 'SCH-000003589',
      email: 'grantadmin@and.digital',
      name: 'AND Test Grant Scheme',
    };
    const expectedUrl = `${BACKEND_HOST}/grant-schemes/${SCHEME_ID}`;
    mock.onGet(expectedUrl).reply(200, MOCK_GRANT_SCHEME);

    const result = await subject.getGrantSchemeById(SCHEME_ID, 'testJwt');
    expect(result).toEqual(MOCK_GRANT_SCHEME);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
  test('Has internal application', async () => {
    const SCHEME_ID = '1';
    const MOCK_RESPONSE: MandatoryQuestionApplicationsInfosDto = {
      hasInternalApplication: true,
      hasPublishedInternalApplication: true,
      hasAdvertPublished: true,
    };
    const expectedUrl = `${BACKEND_HOST}/grant-schemes/${SCHEME_ID}/hasInternalApplication`;
    mock.onGet(expectedUrl).reply(200, MOCK_RESPONSE);

    const result = await subject.hasSchemeInternalApplication(
      SCHEME_ID,
      'testJwt'
    );

    expect(result).toEqual(MOCK_RESPONSE);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
