import next, { GetServerSidePropsContext } from 'next';
import {
  getSubmissionById,
  getQuestionById,
  QuestionData,
  QuestionType,
} from '../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { render, screen } from '@testing-library/react';
import SectionOverview, { getServerSideProps } from './section-overview.page';

jest.mock('../../../utils/jwt');
const mockGetJwt = jest.mocked(getJwtFromCookies);

jest.mock('../../../services/SubmissionService');
const mockGetSubmissionById = jest.mocked(getSubmissionById);
const mockGetQuestionById = jest.mocked(getQuestionById);

//mock context for getServerSideProps test
const context = {
  params: {
    submissionId: '12345678',
  },
  req: {},
  res: { getHeader: () => 'testCSRFToken' },
} as unknown as GetServerSidePropsContext;

const mockApplicationName = 'Test Application';
const mockValidGrantSubmissionId = '12345678';

const getMockQuestionData = () => {
  [
    [
      {
        questionId: 'ELIGIBILITY',
        fieldTitle: 'Eligibility Statement',
        responseType: 'YesNo',
        validation: null,
      },
    ],
    [
      {
        questionId: 'APPLICANT_TYPE',
        fieldTitle: 'Type of organisation',
        responseType: 'Dropdown',
        validation: null,
      },
      {
        questionId: 'APPLICANT_ORG_NAME',
        fieldTitle: 'Name',
        responseType: 'ShortAnswer',
        validation: null,
      },
      {
        questionId: 'APPLICANT_ORG_ADDRESS',
        fieldTitle: 'Address',
        responseType: 'AddressInput',
        validation: null,
      },
      {
        questionId: 'APPLICANT_ORG_CHARITY_NUMBER',
        fieldTitle: 'Enter your Charity Commission number',
        responseType: 'ShortAnswer',
        validation: null,
      },
      {
        questionId: 'APPLICANT_ORG_COMPANIES_HOUSE',
        fieldTitle: 'Enter your Companies House number',
        responseType: 'ShortAnswer',
        validation: null,
      },
    ],
    [
      {
        questionId: 'APPLICANT_AMOUNT',
        fieldTitle: 'How much does your organisation require as a grant?',
        responseType: 'Numeric',
        validation: null,
      },
      {
        questionId: 'BENEFITIARY_LOCATION',
        fieldTitle: 'Where will this funding be spent?',
        responseType: 'MultipleSelection',
        validation: null,
      },
    ],
    [
      {
        questionId: '81c761d7-4174-4594-b747-df606d2a582c',
        fieldTitle: 'Test q',
        responseType: 'ShortAnswer',
        validation: null,
      },
    ],
  ];
};

const mockSections = [
  {
    grantSchemeId: '123',
    grantApplicationId: '345',
    grantSubmissionId: mockValidGrantSubmissionId,
    sectionId: 'ELIGIBILITY',
    sectionTitle: 'Eligibility',
    questionIds: ['ELIGIBILITY'],
    questions: getMockQuestionData[0],
    nextNavigation: null,
    previousNavigation: null,
  },
  {
    grantSchemeId: '123',
    grantApplicationId: '345',
    grantSubmissionId: mockValidGrantSubmissionId,
    sectionId: 'ORGANISATION_DETAILS',
    sectionTitle: 'Your organisation',
    questionIds: [
      'APPLICANT_TYPE',
      'APPLICANT_ORG_NAME',
      'APPLICANT_ORG_ADDRESS',
      'APPLICANT_ORG_CHARITY_NUMBER',
      'APPLICANT_ORG_COMPANIES_HOUSE',
    ],
    questions: getMockQuestionData[1],
    nextNavigation: null,
    previousNavigation: null,
  },
  {
    grantSchemeId: '123',
    grantApplicationId: '345',
    grantSubmissionId: mockValidGrantSubmissionId,
    sectionId: 'FUNDING_DETAILS',
    sectionTitle: 'Funding',
    questionIds: ['APPLICANT_AMOUNT', 'BENEFITIARY_LOCATION'],
    questions: getMockQuestionData[2],
    nextNavigation: null,
    previousNavigation: null,
  },
  {
    grantSchemeId: '123',
    grantApplicationId: '345',
    grantSubmissionId: mockValidGrantSubmissionId,
    sectionId: 'TEST_SECTION',
    sectionTitle: 'Test Q',
    questionIds: ['81c761d7-4174-4594-b747-df606d2a582c'],
    questions: getMockQuestionData[3],
    nextNavigation: null,
    previousNavigation: null,
  },
];

describe('Renders the section summary correctly', () => {
  const mockProps = {
    sections: mockSections,
    applicationName: mockApplicationName,
    grantSubmissionId: mockValidGrantSubmissionId,
  };
  it('should render the section summary correctly', () => {
    render(<SectionOverview {...mockProps} />);

    expect(screen.getByText('Test Application')).toBeInTheDocument();
    expect(
      screen.getByText('Overview of application questions')
    ).toBeInTheDocument();

    expect(screen.getByText('Eligibility')).toBeInTheDocument();
    expect(screen.getByText('Eligibility Statement')).toBeInTheDocument();

    expect(screen.getByText('Your organisation')).toBeInTheDocument();
    expect(screen.getByText('Type of organisation')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();

    expect(screen.getByText('Funding')).toBeInTheDocument();
    expect(
      screen.getByText('How much does your organisation require as a grant?')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Where will this funding be spent?')
    ).toBeInTheDocument();

    expect(screen.getByText('Test Q')).toBeInTheDocument();
    expect(screen.getByText('Test q')).toBeInTheDocument();
  });
});

//TODO:mock getserversideprop
//setup mock data using mocks
