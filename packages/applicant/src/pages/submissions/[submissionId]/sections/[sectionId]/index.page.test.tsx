import { render, screen, within } from '@testing-library/react';
import { ValidationError } from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import {
  getSectionById,
  postHasSectionBeenCompleted,
  QuestionType,
  SectionData,
  SectionReviewBody,
} from '../../../../../services/SubmissionService';
import { createMockRouter } from '../../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';

import { getJwtFromCookies } from '../../../../../utils/jwt';
import { routes } from '../../../../../utils/routes';
import SectionRecap, {
  getMandatoryQuestionId,
  getQuestionUrl,
  getServerSideProps,
  SectionRecapPage,
} from './index.page';

jest.mock('../../../../../services/GrantMandatoryQuestionService');
jest.mock('../../../../../services/SubmissionService');
jest.mock('../../../../../utils/jwt');
jest.mock('next/dist/server/api-utils/node');
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

const context = {
  params: {
    submissionId: '12345678',
    sectionId: '987654321',
  },
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;
const contextNoToken = {
  params: {
    submissionId: '12345678',
    sectionId: '987654321',
  },
  req: {},
  res: {},
} as unknown as GetServerSidePropsContext;
const shortAnswer: QuestionType = {
  questionId: 'APPLICANT_ORG_NAME',
  profileField: 'ORG_NAME',
  fieldTitle: 'Enter the name of your organisation',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'ShortAnswer',
  validation: {
    mandatory: true,
    minLength: 5,
    maxLength: 100,
  },
};

const shortAnswerWithResponse: QuestionType = {
  questionId: 'QUESTION_ID_TEST',
  profileField: 'PROFILE_FIELD_TEST',
  fieldTitle: 'fieldTitleTest',
  hintText: 'testhintText',
  responseType: 'ShortAnswer',
  validation: {
    mandatory: false,
    minLength: 5,
    maxLength: 100,
  },
  response: 'testResponse',
};

const numeric: QuestionType = {
  questionId: 'APPLICANT_AMOUNT',
  profileField: 'ORG_AMOUNT',
  fieldTitle: 'Enter the amount',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'MultipleSelection',
  validation: {
    mandatory: true,
    greaterThanZero: true,
  },
  multiResponse: ['test', 'test2'],
};
const SECTION_MOCK: SectionData = {
  sectionId: '987654321',
  sectionStatus: 'NOT_STARTED',
  sectionTitle: 'TEST_TITLE',
  questions: [numeric, shortAnswerWithResponse, shortAnswer],
};

const pageProps: SectionRecapPage = {
  submissionId: context.params.submissionId.toString(),
  section: SECTION_MOCK,
  fieldErrors: [],
  csrfToken: 'csrfToken',
  mandatoryQuestionId: '',
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('getServerSideProps', () => {
  it('should return sections and expected props', async () => {
    (getSectionById as jest.Mock).mockReturnValue(SECTION_MOCK);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        submissionId: '12345678',
        section: SECTION_MOCK,
        fieldErrors: [],
        csrfToken: 'testCSRFToken',
      },
    });
    expect(getSectionById).toHaveBeenCalled();
    expect(getSectionById).toHaveBeenCalledWith(
      context.params.submissionId,
      context.params.sectionId,
      'testJwt'
    );
  });

  it('should return sections and expected props with no csrf Token', async () => {
    (getSectionById as jest.Mock).mockReturnValue(SECTION_MOCK);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(contextNoToken);

    expect(response).toEqual({
      props: {
        submissionId: '12345678',
        section: SECTION_MOCK,
        fieldErrors: [],
        csrfToken: '',
      },
    });
    expect(getSectionById).toHaveBeenCalled();
    expect(getSectionById).toHaveBeenCalledWith(
      context.params.submissionId,
      context.params.sectionId,
      'testJwt'
    );
  });

  it('should redirect if there are no errors', async () => {
    const requestBody = { isComplete: true } as SectionReviewBody;

    const req = {
      method: 'POST',
      csrfToken: () => 'testCSRFToken',
    };

    const ctx = {
      params: {
        submissionId: '12345678',
        sectionId: '987654321',
      },
      req,
      res: {},
    };

    const validationErrors: ValidationError[] = [];

    const acceptedValue = {
      response: { data: { errors: validationErrors } },
    };
    const expectedProps = {
      redirect: {
        destination: routes.submissions.sections(
          context.params.submissionId.toString()
        ),
        statusCode: 302,
      },
    };
    (getSectionById as jest.Mock).mockReturnValue(SECTION_MOCK);
    (parseBody as jest.Mock).mockResolvedValue(requestBody);
    (postHasSectionBeenCompleted as jest.Mock).mockReturnValue(acceptedValue);
    const response = (await getServerSideProps(
      ctx as any
    )) as NextGetServerSidePropsResponse;
    expect(response).toEqual(expectedProps);
  });

  it('should return error params if there are errors', async () => {
    const requestBody = {} as SectionReviewBody;

    const req = {
      method: 'POST',
      csrfToken: () => 'testCSRFToken',
    };

    const ctx = {
      params: {
        submissionId: '12345678',
        sectionId: '987654321',
      },
      req,
      res: {},
    };

    const validationErrors: ValidationError[] = [
      {
        fieldName: 'isComplete',
        errorMessage:
          "Select 'Yes, i've completed this section' or 'No, I'll come back later'",
      },
    ];

    const rejectedValue = {
      response: { data: { errors: validationErrors } },
    };
    const expectedProps = {
      props: {
        submissionId: '12345678',
        section: SECTION_MOCK,
        csrfToken: 'testCSRFToken',
        fieldErrors: validationErrors,
      },
    };
    (getSectionById as jest.Mock).mockReturnValue(SECTION_MOCK);
    (parseBody as jest.Mock).mockResolvedValue(requestBody);
    (postHasSectionBeenCompleted as jest.Mock).mockRejectedValue(rejectedValue);
    const response = (await getServerSideProps(
      ctx as any
    )) as NextGetServerSidePropsResponse;
    expect(response).toEqual(expectedProps);
  });
});

describe('getSectionUrl', () => {
  it('should return the correct URL for APPLICANT_ORG_NAME in ORGANISATION_DETAILS', () => {
    const sectionId = 'ORGANISATION_DETAILS';
    const questionId = 'APPLICANT_ORG_NAME';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-name?fromSubmissionPage=true&submissionId=456&sectionId=ORGANISATION_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for APPLICANT_ORG_ADDRESS in ORGANISATION_DETAILS', () => {
    const sectionId = 'ORGANISATION_DETAILS';
    const questionId = 'APPLICANT_ORG_ADDRESS';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-address?fromSubmissionPage=true&submissionId=456&sectionId=ORGANISATION_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for APPLICANT_TYPE in ORGANISATION_DETAILS', () => {
    const sectionId = 'ORGANISATION_DETAILS';
    const questionId = 'APPLICANT_TYPE';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-type?fromSubmissionPage=true&submissionId=456&sectionId=ORGANISATION_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for APPLICANT_ORG_COMPANIES_HOUSE in ORGANISATION_DETAILS', () => {
    const sectionId = 'ORGANISATION_DETAILS';
    const questionId = 'APPLICANT_ORG_COMPANIES_HOUSE';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-companies-house-number?fromSubmissionPage=true&submissionId=456&sectionId=ORGANISATION_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for APPLICANT_ORG_CHARITY_NUMBER in ORGANISATION_DETAILS', () => {
    const sectionId = 'ORGANISATION_DETAILS';
    const questionId = 'APPLICANT_ORG_CHARITY_NUMBER';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-charity-commission-number?fromSubmissionPage=true&submissionId=456&sectionId=ORGANISATION_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for APPLICANT_AMOUNT in FUNDING_DETAILS', () => {
    const sectionId = 'FUNDING_DETAILS';
    const questionId = 'APPLICANT_AMOUNT';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-funding-amount?fromSubmissionPage=true&submissionId=456&sectionId=FUNDING_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for BENEFITIARY_LOCATION in FUNDING_DETAILS', () => {
    const sectionId = 'FUNDING_DETAILS';
    const questionId = 'BENEFITIARY_LOCATION';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/mandatory-questions/123/organisation-funding-location?fromSubmissionPage=true&submissionId=456&sectionId=FUNDING_DETAILS';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });

  it('should return the correct URL for a given sectionId and questionId if sectionId is not ORGANISATION_DETAILS or FUNDING_DETAILS', () => {
    const sectionId = 'ELIGIBILITY';
    const questionId = 'SOME_QUESTION';
    const mandatoryQuestionId = '123';
    const submissionId = '456';

    const expectedUrl =
      '/submissions/456/sections/ELIGIBILITY/questions/SOME_QUESTION';

    expect(
      getQuestionUrl(sectionId, questionId, mandatoryQuestionId, submissionId)
    ).toBe(expectedUrl);
  });
});

describe('getMandatoryQuestionId', () => {
  it('should return the mandatory question id as a string when sectionId is "ORGANISATION_DETAILS" and getMandatoryQuestionBySubmissionId returns a valid response with an id', async () => {
    const submissionId = 'validSubmissionId';
    const sectionId = 'ORGANISATION_DETAILS';
    const jwt = 'validJwt';

    const mockResponse = {
      id: 12345,
    };
    const mockService = {
      getMandatoryQuestionBySubmissionId: jest
        .fn()
        .mockResolvedValue(mockResponse),
    };

    const result = await getMandatoryQuestionId(submissionId, sectionId, jwt);

    expect(result).toBe(mockResponse.id.toString());
    expect(mockService.getMandatoryQuestionBySubmissionId).toHaveBeenCalledWith(
      submissionId,
      jwt
    );
  });

  it('should return an empty string when sectionId is not "ORGANISATION_DETAILS" or "FUNDING_DETAILS"', async () => {
    const submissionId = 'validSubmissionId';
    const sectionId = 'OTHER_SECTION';
    const jwt = 'validJwt';

    const result = await getMandatoryQuestionId(submissionId, sectionId, jwt);

    expect(result).toBe('');
  });
});

describe('Section Recap Page', () => {
  describe('no errors', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SectionRecap {...pageProps} />
        </RouterContext.Provider>
      );
    });
    test('should render the right header', () => {
      screen.getByRole('heading', {
        name: /summary of test_title/i,
      });
    });
    test('should render the list of question with the relative answers and add or Change button based on the answer content', () => {
      screen.getByText(/enter the amount/i);
      screen.getByText(/test,/i);
      screen.getByText(/test2/i);
      screen.getByText('fieldTitleTest (optional)');
      screen.getByText(/testResponse/i);
      screen.getByText(/enter the name of your organisation/i);
      screen.getByText('-');
      const changeLink = screen.getByRole('link', {
        name: /change applicant amount/i,
      });
      const addLink = screen.getByRole('link', {
        name: /add applicant org name/i,
      });
      expect(changeLink).toHaveAttribute(
        'href',
        '/submissions/12345678/sections/987654321/questions/APPLICANT_AMOUNT'
      );
      expect(addLink).toHaveAttribute(
        'href',
        '/submissions/12345678/sections/987654321/questions/APPLICANT_ORG_NAME'
      );
    });

    test('should render Have you completed this section form', () => {
      screen.getByRole('heading', {
        name: /have you completed this section\?/i,
      });
      screen.getByRole('radio', {
        name: /yes, i've completed this section/i,
      });
      screen.getByText(/yes, i've completed this section/i);
      screen.getByRole('radio', {
        name: /no, i'll come back later/i,
      });
      screen.getByText(/no, i'll come back later/i);
      screen.getByRole('button', {
        name: /save and continue/i,
      });
    });

    test('should render the back button', () => {
      const backButton = screen.getByRole('link', { name: 'Back' });

      expect(backButton).toHaveAttribute(
        'href',
        '/submissions/12345678/sections/987654321/questions/APPLICANT_ORG_NAME'
      );
    });
  });

  describe('with errors', () => {
    beforeEach(async () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${context.params.submissionId}/sections`,
          })}
        >
          <SectionRecap
            {...pageProps}
            fieldErrors={[
              { fieldName: 'isComplete', errorMessage: 'errorTest' },
            ]}
          />
        </RouterContext.Provider>
      );
    });
    test('should render error Banner', () => {
      screen.getByRole('heading', {
        name: /there is a problem/i,
      });
      screen.getByRole('link', {
        name: /errortest/i,
      });
    });

    test('should render error inside form', () => {
      const group = screen.getByRole('group', {
        name: /have you completed this section\?/i,
      });

      within(group).getByText(/errortest/i);
    });
  });
});
