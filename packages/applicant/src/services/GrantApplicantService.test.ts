import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GrantApplicant } from '../models/GrantApplicant';
import { axiosConfig } from '../utils/jwt';
import { GrantApplicantService } from './GrantApplicantService';
import getConfig from 'next/config';

jest.mock('../utils/jwt');
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

const mockAxiosConfig = {
  headers: { Authorization: 'Bearer testJwt', Accept: 'application/json' },
};
describe('Grant Applicant Service', () => {
  const env = process.env;
  beforeEach(() => {
    process.env = { ...env };
  });

  const spy = jest.spyOn(axios, 'get');
  const mock = new MockAdapter(axios);
  const subject = GrantApplicantService.getInstance();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Get applicant', async () => {
    const APPLICANT_ID = '75ab5fbd-0682-4d3d-a467-01c7a447f07c';
    const MOCK_GRANT_APPLICANT: GrantApplicant = {
      id: APPLICANT_ID,
      email: 'test@email.com',
      organisation: {
        id: 'a048d000003Sk39AAC',
        legalName: 'Boat Service',
        type: 'Registered Charity',
        addressLine1: '1 Apex Lane',
        addressLine2: 'Apexis',
        town: 'Apex Town',
        county: 'Apex County',
        postcode: 'A10 2PE',
        charityCommissionNumber: '1122334455',
        companiesHouseNumber: '66778899',
      },
    };

    const expectedUrl = `${BACKEND_HOST}/grant-applicant`;

    mock
      .onGet(
        expectedUrl,
        (axiosConfig as jest.Mock).mockReturnValue({
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer testJwt`,
          },
        })
      )
      .reply(200, MOCK_GRANT_APPLICANT);

    const result = await subject.getGrantApplicant('jwt');
    expect(result).toEqual(MOCK_GRANT_APPLICANT);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer testJwt`,
      },
    });
  });

  test('DoesApplicantExist', async () => {
    const expectedUrl = `${BACKEND_HOST}/grant-applicant/does-exist`;

    mock
      .onGet(
        expectedUrl,
        (axiosConfig as jest.Mock).mockReturnValue({
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer testJwt`,
          },
        })
      )
      .reply(200, true);

    const result = await subject.doesApplicantExist('jwt');
    expect(result).toEqual(true);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer testJwt`,
      },
    });
  });

  test('CreateApplicant', async () => {
    const spy = jest.spyOn(axios, 'post');
    const expectedUrl = `${BACKEND_HOST}/grant-applicant/create`;
    (axiosConfig as jest.Mock).mockReturnValue(mockAxiosConfig);
    mock.onPost(expectedUrl).reply(200, 'Nice');

    const result = await subject.createAnApplicant('jwt');
    expect(result).toEqual('Nice');
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, null, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer testJwt`,
      },
    });
  });
});
