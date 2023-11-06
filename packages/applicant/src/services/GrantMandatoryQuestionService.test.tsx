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

describe('Axios call to get mandatory question data', () => {
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
      MANDATORY_QUESTION_ID,
      'testJwt'
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

describe('Axios call to get mandatory question data by submission id', () => {
  const spy = jest.spyOn(axios, 'get');

  it('should get mandatoryQuestion data by submission id', async () => {
    const SUBMISSION_ID = '1';
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
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/get-by-submission/${SUBMISSION_ID}`;
    mock.onGet(expectedUrl).reply(200, MockMandatoryQuestionData);

    const result = await subject.getMandatoryQuestionBySubmissionId(
      SUBMISSION_ID,
      'testJwt'
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

describe('Axios call to get mandatory question data by scheme id', () => {
  const spy = jest.spyOn(axios, 'get');

  it('should get mandatoryQuestion data by scheme id', async () => {
    const SCHEME_ID = '1';
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
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/scheme/${SCHEME_ID}`;
    mock.onGet(expectedUrl).reply(200, MockMandatoryQuestionData);

    const result = await subject.getMandatoryQuestionBySchemeId(
      'testJwt',
      SCHEME_ID
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
describe('update mandatoryQuestion', () => {
  const spy = jest.spyOn(axios, 'patch');

  const MANDATORY_QUESTION_ID = 'a048d000003Sk39AAC';
  it('should send a request to update the mandatory-question', async () => {
    const mandatoryQuestionData: GrantMandatoryQuestionDto = {
      name: 'AND Digital',
    };

    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/${MANDATORY_QUESTION_ID}?url=url`;
    mock.onPatch(expectedUrl, mandatoryQuestionData).reply(200);
    await subject.updateMandatoryQuestion(
      'testJwt',
      MANDATORY_QUESTION_ID,
      'url',
      mandatoryQuestionData
    );

    expect(spy).toHaveBeenCalledWith(expectedUrl, mandatoryQuestionData, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});

describe('create mandatoryQuestion', () => {
  const spy = jest.spyOn(axios, 'post');

  const SCHEME_ID = '1';
  it('should send a request to post the mandatory-question', async () => {
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions?schemeId=${SCHEME_ID}`;
    mock.onPost(expectedUrl).reply(200);
    await subject.createMandatoryQuestion(SCHEME_ID, 'testJwt');

    expect(spy).toHaveBeenCalledWith(
      expectedUrl,
      {},
      {
        headers: {
          Authorization: `Bearer testJwt`,
          Accept: 'application/json',
        },
      }
    );
  });
});

describe('Axios call to existBySchemeIdAndApplicantId', () => {
  const spy = jest.spyOn(axios, 'get');

  it('should get true when mq exist for that scheme', async () => {
    const SCHEME_ID = '1';
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/scheme/${SCHEME_ID}/exists`;
    mock.onGet(expectedUrl).reply(200, true);

    const result = await subject.existBySchemeIdAndApplicantId(
      SCHEME_ID,
      'testJwt'
    );
    expect(result).toEqual(true);
    expect(spy).toBeCalled();
    expect(spy).toBeCalledWith(expectedUrl, {
      headers: {
        Authorization: `Bearer testJwt`,
        Accept: 'application/json',
      },
    });
  });
});
