import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import getConfig from 'next/config';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from './GrantMandatoryQuestionService';

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
const subject = GrantMandatoryQuestionService.getInstance();

afterEach(() => {
  mock.resetHandlers();
});

afterAll(() => {
  mock.reset();
});

describe('Axios call to get organisation data', () => {
  const spy = jest.spyOn(axios, 'get');

  it('should get mandatoryQuestion data', async () => {
    const MANDATORY_QUESTION_ID = 'a048d000003Sk39AAC';
    const MockMandatoryQuestionData: GrantMandatoryQuestionDto = {
      schemeId: 1,
      submissionId: null,
      name: null,
      addressLine1: null,
      addressLine2: null,
      city: null,
      county: null,
      postcode: null,
      charityCommissionNumber: null,
      companiesHouseNumber: null,
      orgType: null,
      fundingAmount: null,
      fundingLocation: null,
    };
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/${MANDATORY_QUESTION_ID}`;
    mock.onGet(expectedUrl).reply(200, MockMandatoryQuestionData);

    const result = await subject.getMandatoryQuestionById(
      'testJwt',
      MANDATORY_QUESTION_ID
    );
    expect(result).toEqual(MockMandatoryQuestionData);
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

  const MANDATORY_QUESTION_ID = 'a048d000003Sk39AAC';
  it('should send a request to update the organisation', async () => {
    const organisationData: GrantMandatoryQuestionDto = {
      name: 'AND Digital',
    };

    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/${MANDATORY_QUESTION_ID}`;
    mock.onPatch(expectedUrl, organisationData).reply(200);
    await subject.updateMandatoryQuestion(
      'testJwt',
      MANDATORY_QUESTION_ID,
      organisationData
    );

    expect(spy).toHaveBeenCalledWith(expectedUrl, organisationData, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
