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

describe('ensureMandatoryQuestionForSubmission', () => {
  const spy = jest.spyOn(axios, 'post');

  const SUBMISSION_ID = 'sub-123';
  it('should send a request to ensure the per-submission mandatory question', async () => {
    const MockMandatoryQuestionData: GrantMandatoryQuestionDto = {
      id: 'mq-123',
      submissionId: SUBMISSION_ID,
    };
    const { serverRuntimeConfig } = getConfig();
    const BACKEND_HOST = serverRuntimeConfig.backendHost;
    const expectedUrl = `${BACKEND_HOST}/grant-mandatory-questions/ensure-mandatory-question/${SUBMISSION_ID}`;
    mock.onPost(expectedUrl).reply(200, MockMandatoryQuestionData);

    const result = await subject.ensureMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID
    );

    expect(result).toEqual(MockMandatoryQuestionData);
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

describe('resolveMandatoryQuestionForSubmission', () => {
  const postSpy = jest.spyOn(axios, 'post');
  const getSpy = jest.spyOn(axios, 'get');

  const SUBMISSION_ID = 'sub-123';
  const { serverRuntimeConfig } = getConfig();
  const BACKEND_HOST = serverRuntimeConfig.backendHost;
  const ensureUrl = `${BACKEND_HOST}/grant-mandatory-questions/ensure-mandatory-question/${SUBMISSION_ID}`;
  const readUrl = `${BACKEND_HOST}/grant-mandatory-questions/get-by-submission/${SUBMISSION_ID}`;

  beforeEach(() => {
    postSpy.mockClear();
    getSpy.mockClear();
  });

  it('heals (POST ensure) for an editable submission', async () => {
    const dto: GrantMandatoryQuestionDto = { id: 'mq-1' };
    mock.onPost(ensureUrl).reply(200, dto);

    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { hasBeenSubmitted: false }
    );

    expect(result).toEqual(dto);
    expect(postSpy).toHaveBeenCalledWith(ensureUrl, {}, expect.anything());
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('reads (GET) when the submission has been submitted', async () => {
    const dto: GrantMandatoryQuestionDto = { id: 'mq-2' };
    mock.onGet(readUrl).reply(200, dto);

    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { hasBeenSubmitted: true }
    );

    expect(result).toEqual(dto);
    expect(getSpy).toHaveBeenCalledWith(readUrl, expect.anything());
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('reads (GET) when the grant application has been REMOVED', async () => {
    const dto: GrantMandatoryQuestionDto = { id: 'mq-3' };
    mock.onGet(readUrl).reply(200, dto);

    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { hasBeenSubmitted: false, grantApplicationStatus: 'REMOVED' }
    );

    expect(result).toEqual(dto);
    expect(getSpy).toHaveBeenCalledWith(readUrl, expect.anything());
    expect(postSpy).not.toHaveBeenCalled();
  });

  it('heals for an editable organisation/funding section', async () => {
    const dto: GrantMandatoryQuestionDto = { id: 'mq-4' };
    mock.onPost(ensureUrl).reply(200, dto);

    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { sectionId: 'FUNDING_DETAILS' }
    );

    expect(result).toEqual(dto);
    expect(postSpy).toHaveBeenCalledWith(ensureUrl, {}, expect.anything());
  });

  it('returns null without any call for a non mandatory-question section', async () => {
    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { sectionId: 'ELIGIBILITY' }
    );

    expect(result).toBeNull();
    expect(postSpy).not.toHaveBeenCalled();
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('returns null when the backend call fails', async () => {
    mock.onPost(ensureUrl).reply(500);

    const result = await subject.resolveMandatoryQuestionForSubmission(
      'testJwt',
      SUBMISSION_ID,
      { hasBeenSubmitted: false }
    );

    expect(result).toBeNull();
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
