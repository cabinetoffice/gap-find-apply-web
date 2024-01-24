import { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import {
  ApplicationDetailsInterface,
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  QuestionType,
} from '../../../services/SubmissionService';
import { getApplicationStatusBySchemeId } from '../../../services/ApplicationService';
import SubmissionSummary, {
  getServerSideProps,
  QuestionRow,
  SectionCard,
} from './summary.page';
import { getJwtFromCookies } from '../../../utils/jwt';
import { mockServiceMethod } from '../../../testUtils/unitTestHelpers';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';

jest.mock('./sections/[sectionId]/processMultiResponse', () => {
  return {
    ProcessMultiResponse: jest.fn(() => (
      <div data-testid="mock-process-multi-response">Multi Response</div>
    )),
  };
});

jest.mock(
  'next/link',
  () =>
    function Link(props: {
      id: string;
      href: string;
      children: ReactElement;
    }): ReactElement {
      return <a {...props} />;
    }
);

jest.mock('../../../services/SubmissionService');
jest.mock('../../../utils/constants');
jest.mock('../../../utils/jwt');
jest.mock('../../../utils/csrf');

const mockGetApplicationStatusBySchemeId = jest.mocked(
  getApplicationStatusBySchemeId
);
const mockGetSubmissionById = jest.mocked(getSubmissionById);
const mockGetJwtFromCookies = jest.mocked(getJwtFromCookies);
const mockHasSubmissionBeenSubmitted = jest.mocked(hasSubmissionBeenSubmitted);

jest.mock('../../../services/ApplicationService', () => ({
  getApplicationStatusBySchemeId: jest.fn(),
}));

const spiedGetMandatoryQuestionBySubmissionId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionBySubmissionId'
);

const context = {
  params: {
    submissionId: '12345678',
  },
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;

const mockMandatoryQuestionDto = (): GrantMandatoryQuestionDto => ({
  id: '87654321',
  schemeId: 1,
  submissionId: '12345678',
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
});

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

const contextNoToken = {
  params: {
    submissionId: '12345678',
  },
  req: { csrfToken: () => '' },
  res: {},
} as unknown as GetServerSidePropsContext;

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
const eligibility: QuestionType = {
  questionId: 'ELIGIBILITY',
  profileField: 'ORG_AMOUNT',
  fieldTitle: 'Enter the amount',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'YesNo',
  validation: {
    mandatory: true,
    greaterThanZero: true,
  },
  response: 'Yes',
};
const propsWithAllValues: ApplicationDetailsInterface = {
  grantSchemeId: 'schemeId',
  grantApplicationId: 'string',
  grantSubmissionId: 'string',
  applicationName: 'Name of the grant being applied for',
  submissionStatus: 'IN_PROGRESS',
  sections: [
    {
      sectionId: 'ELIGIBILITY',
      sectionTitle: 'Eligibility',
      sectionStatus: 'COMPLETED',
      questionIds: [eligibility].map((q) => q.questionId),
      questions: [eligibility],
    },
    {
      sectionId: 'ORGANISATION_DETAILS',
      sectionTitle: 'Your Organisation',
      sectionStatus: 'IN_PROGRESS',
      questionIds: [shortAnswer].map((q) => q.questionId),
      questions: [shortAnswer],
    },
    {
      sectionId: 'FUNDING_DETAILS',
      sectionTitle: 'Funding',
      sectionStatus: 'IN_PROGRESS',
      questionIds: [numeric].map((q) => q.questionId),
      questions: [numeric],
    },
    {
      sectionId: 'ESSENTIAL',
      sectionTitle: 'Essential Information',
      sectionStatus: 'COMPLETED',
      questionIds: [shortAnswer].map((q) => q.questionId),
      questions: [shortAnswer],
    },
    {
      sectionId: 'NON-ESSENTIAL',
      sectionTitle: 'Non Essential Information',
      sectionStatus: 'IN_PROGRESS',
      questionIds: [shortAnswer, numeric].map((q) => q.questionId),
      questions: [shortAnswer, numeric],
    },
  ],
};

mockServiceMethod(
  spiedGetMandatoryQuestionBySubmissionId,
  mockMandatoryQuestionDto
);
(getQuestionById as jest.Mock).mockImplementation(
  async (_submissionId, _sectionId, questionId, _jwt) => {
    return {
      question: [numeric, eligibility, shortAnswer].find(
        (q) => q.questionId === questionId
      ),
    };
  }
);

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return sections, submissionId, applicationName', async () => {
    mockGetApplicationStatusBySchemeId.mockResolvedValue('PUBLISHED');
    mockGetSubmissionById.mockResolvedValue(propsWithAllValues);
    mockGetJwtFromCookies.mockReturnValue('testJwt');
    mockHasSubmissionBeenSubmitted.mockResolvedValue(false);

    const response = await getServerSideProps(context);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        hasSubmissionBeenSubmitted: false,
        mandatoryQuestionId: '87654321',
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });

  it('should return correct object from server side props with no token', async () => {
    mockGetSubmissionById.mockResolvedValue(propsWithAllValues);
    mockGetJwtFromCookies.mockReturnValue('testJwt');
    mockHasSubmissionBeenSubmitted.mockResolvedValue(false);

    const response = await getServerSideProps(contextNoToken);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: '',
        hasSubmissionBeenSubmitted: false,
        mandatoryQuestionId: '87654321',
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });

  it('should redirect if application has been submitted', async () => {
    mockGetSubmissionById.mockResolvedValue(propsWithAllValues);
    mockGetJwtFromCookies.mockReturnValue('testJwt');
    mockHasSubmissionBeenSubmitted.mockResolvedValue(true);

    const response = await getServerSideProps(context);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantApplicationId,
        applicationName: propsWithAllValues.applicationName,
        csrfToken: 'testCSRFToken',
        hasSubmissionBeenSubmitted: true,
        mandatoryQuestionId: '87654321',
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });
});

describe('SubmissionSummary', () => {
  const mockSections = [
    {
      sectionId: 'section1',
      sectionTitle: 'Section 1',
      questions: [
        {
          questionId: 'q1',
          fieldTitle: 'Question 1',
          multiResponse: null,
          responseType: 'text',
          response: 'Answer 1',
        },
      ],
    },
    {
      sectionId: 'section2',
      sectionTitle: 'Section 2',
      questions: [
        {
          questionId: 'q2',
          fieldTitle: 'Question 2',
          multiResponse: null,
          responseType: 'text',
          response: 'Answer 2',
        },
      ],
    },
  ];

  const mockProps = {
    sections: mockSections,
    grantSubmissionId: '123',
    mandatoryQuestionId: '456',
    applicationName: 'My Mock Application',
    hasSubmissionBeenSubmitted: false,
    csrfToken: 'abc123',
  };

  it('renders SubmissionSummary component correctly', () => {
    render(<SubmissionSummary {...mockProps} />);

    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(
      screen.getByText('Check your answers before submitting your application')
    ).toBeInTheDocument();
  });

  it('renders SubmissionSummary component with submitted application text', () => {
    const submittedProps = {
      ...mockProps,
      hasSubmissionBeenSubmitted: true,
    };

    render(<SubmissionSummary {...submittedProps} />);

    expect(screen.getByText('Your application')).toBeInTheDocument();
    expect(screen.getByText('Return to your profile')).toBeInTheDocument();
  });

  it('renders Download section correctly', () => {
    render(<SubmissionSummary {...mockProps} />);
    expect(
      screen.getByText('Download a copy of your application')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'download a copy of your answers (ZIP)',
      })
    ).toBeInTheDocument();
  });

  it('renders "Return to your profile" button when application has been submitted', () => {
    const submittedProps = {
      ...mockProps,
      hasSubmissionBeenSubmitted: true,
    };

    render(<SubmissionSummary {...submittedProps} />);

    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(screen.getByText('Your application')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
      'href',
      `http://localhost/applications`
    );

    expect(
      screen.getByRole('button', { name: 'Return to your profile' })
    ).toHaveProperty('href', `http://localhost/applications`);
  });

  it('renders "Submit application" button when application has not been submitted', () => {
    render(<SubmissionSummary {...mockProps} />);
    expect(screen.getByText('My Mock Application')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
      'href',
      `http://localhost/submissions/${mockProps.grantSubmissionId}/sections`
    );
    expect(
      screen.getByText('Check your answers before submitting your application')
    ).toBeInTheDocument();
    expect(screen.getByText('Submit your application')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Submit application' })
    ).toHaveProperty(
      'href',
      `http://localhost/submissions/${mockProps.grantSubmissionId}/submit`
    );
  });
});

describe('SectionCard', () => {
  const mockSection = {
    sectionTitle: 'Mock Section',
    questions: [
      {
        questionId: 'q1',
        fieldTitle: 'Question 1',
        multiResponse: null,
        responseType: 'text',
        response: 'Answer 1',
      },
      {
        questionId: 'q2',
        fieldTitle: 'Question 2',
        multiResponse: null,
        responseType: 'text',
        response: 'Answer 2',
      },
    ],
  };

  it('renders SectionCard component correctly', () => {
    render(
      <SectionCard
        section={mockSection}
        submissionId="123"
        mandatoryQuestionId="456"
        readOnly={false}
      />
    );

    expect(screen.getByText('Mock Section')).toBeInTheDocument();
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
  });

  it('renders SectionCard with readOnly mode correctly', () => {
    render(
      <SectionCard
        section={mockSection}
        submissionId="123"
        mandatoryQuestionId="456"
        readOnly={true}
      />
    );

    // Check that "Change" is not present in readOnly mode
    expect(screen.queryByText('Change')).toBeNull();
  });
});

describe('QuestionRow', () => {
  const mockQuestion = {
    questionId: 'q1',
    fieldTitle: 'Question 1',
    multiResponse: null,
    responseType: 'text',
    response: 'Answer 1',
  };

  it('renders QuestionRow component correctly', () => {
    const mockProps = {
      question: mockQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: false,
    };
    render(<QuestionRow {...mockProps} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 1')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Change' })).toHaveProperty(
      'href',
      'http://localhost/submissions/456/sections/789/questions/q1?fromSubmissionSummaryPage=true&submissionId=456&sectionId=789'
    );
    expect(screen.queryByText('Add')).toBeNull();
  });

  it('renders default values when response is null', () => {
    const nullResponseQuestion = {
      ...mockQuestion,
      response: null,
    };
    const mockProps = {
      question: nullResponseQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: false,
    };

    render(<QuestionRow {...mockProps} />);

    expect(screen.getByText('-')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Add' })).toHaveProperty(
      'href',
      'http://localhost/submissions/456/sections/789/questions/q1?fromSubmissionSummaryPage=true&submissionId=456&sectionId=789'
    );

    expect(screen.queryByText('Change')).toBeNull();
  });

  it('does not render actions when in read-only mode', () => {
    const mockProps = {
      question: mockQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: true,
    };
    render(<QuestionRow {...mockProps} />);

    expect(screen.queryByText('Change')).toBeNull();
  });

  it('calls ProcessMultiResponse when multiResponse is present', () => {
    const multiResponseQuestion = {
      ...mockQuestion,
      multiResponse: [{ label: 'Option 1', value: 'option1', selected: true }],
    };
    const mockProps = {
      question: multiResponseQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: false,
    };

    render(<QuestionRow {...mockProps} />);

    expect(screen.getByText('Multi Response')).toBeInTheDocument();
  });

  it('does not call ProcessMultiResponse when multiResponse is empty array', () => {
    const multiResponseQuestion = {
      ...mockQuestion,
      multiResponse: [],
      response: null,
    };
    const mockProps = {
      question: multiResponseQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: false,
    };

    render(<QuestionRow {...mockProps} />);

    expect(screen.queryByText('Multi Response')).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('does not call ProcessMultiResponse when multiResponse is array with empty strings', () => {
    const multiResponseQuestion = {
      ...mockQuestion,
      multiResponse: ['', '', ''],
      response: null,
    };
    const mockProps = {
      question: multiResponseQuestion,
      mandatoryQuestionId: '123',
      submissionId: '456',
      section: {
        sectionId: '789',
      },
      readOnly: false,
    };

    render(<QuestionRow {...mockProps} />);

    expect(screen.queryByText('Multi Response')).not.toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
