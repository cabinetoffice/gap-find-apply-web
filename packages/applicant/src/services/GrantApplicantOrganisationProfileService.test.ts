import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GrantApplicantOrganisationProfile } from '../models/GrantApplicantOrganisationProfile';
import {
  GrantApplicantOrganisationProfileService,
  UpdateOrganisationDetailsDto,
} from './GrantApplicantOrganisationProfileService';
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

const mock = new MockAdapter(axios);
const subject = GrantApplicantOrganisationProfileService.getInstance();

afterEach(() => {
  mock.resetHandlers();
});

afterAll(() => {
  mock.reset();
});

describe('Axios call to get organisation data', () => {
  const spy = jest.spyOn(axios, 'get');

  test('should get organisation data', async () => {
    const ORGANISATION_ID = 'a048d000003Sk39AAC';
    const MockOrganisationData: GrantApplicantOrganisationProfile = {
      id: ORGANISATION_ID,
      legalName: 'Boat Service',
      type: 'Registered Charity',
      addressLine1: '1 Apex Lane',
      addressLine2: 'Apexis',
      town: 'Apex Town',
      county: 'Apex County',
      postcode: 'A10 2PE',
      charityCommissionNumber: '1122334455',
      companiesHouseNumber: '66778899',
    };
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-applicant-organisation-profile/${ORGANISATION_ID}`;
    mock.onGet(expectedUrl).reply(200, MockOrganisationData);

    const result = await subject.getOrganisationById(
      ORGANISATION_ID,
      'testJwt'
    );
    expect(result).toEqual(MockOrganisationData);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});

describe('updateOrganisation', () => {
  const spy = jest.spyOn(axios, 'patch');

  const ORGANISATION_ID = 'a048d000003Sk39AAC';
  it('should send a request to update the organisation', async () => {
    const organisationData: UpdateOrganisationDetailsDto = {
      id: ORGANISATION_ID,
      legalName: 'AND Digital',
    };

    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-applicant-organisation-profile/${ORGANISATION_ID}`;
    mock.onPatch(expectedUrl, organisationData).reply(200);
    await subject.updateOrganisation(organisationData, 'testJwt');

    expect(spy).toHaveBeenCalledWith(expectedUrl, organisationData, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
