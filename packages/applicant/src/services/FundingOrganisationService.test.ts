import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { FundingOrganisation } from '../types/models/FundingOrganisation';
import { FundingOrganisationService } from './FundingOrganisationService';
import getConfig from 'next/config';

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

describe('Funding organisation service', () => {
  const spy = jest.spyOn(axios, 'get');
  const mock = new MockAdapter(axios);
  const subject = FundingOrganisationService.getInstance();

  afterEach(() => {
    mock.restore();
  });

  test('Get funding organisation by funderId', async () => {
    const FUNDER_ID = '1';
    const MOCK_FUNDING_ORGANISATION: FundingOrganisation = {
      id: FUNDER_ID,
      organisationName: 'Some name',
    };
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/funding-organisations/${FUNDER_ID}`;
    mock.onGet(expectedUrl).reply(200, MOCK_FUNDING_ORGANISATION);

    const result = await subject.getFundingOrganisationById(
      FUNDER_ID,
      'testJwt'
    );
    expect(result).toEqual(MOCK_FUNDING_ORGANISATION);
    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
