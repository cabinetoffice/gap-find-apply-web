import next, { GetServerSidePropsContext } from 'next';
import {
  getSubmissionById,
  getQuestionById,
  QuestionType,
} from '../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { render, screen } from '@testing-library/react';
import SectionOverview, {
  SingleSection,
  getServerSideProps,
} from './section-overview.page';
import { routes } from '../../../utils/routes';

jest.mock('../../../utils/jwt');
const mockGetJwtFromCookies = jest.mocked(getJwtFromCookies);

jest.mock('../../../services/SubmissionService');
const mockGetSubmissionById = jest.mocked(getSubmissionById);

const context = {
  params: {
    submissionId: '12345678',
  },
  req: {},
  res: { getHeader: () => 'testCSRFToken' },
} as unknown as GetServerSidePropsContext;
//   [
//     [
//       {
//         questionId: 'ELIGIBILITY',
//         fieldTitle: 'Eligibility Statement',
//         responseType: 'YesNo',
//         validation: null,
//       },
//     ],
//     [
//       {
//         questionId: 'APPLICANT_TYPE',
//         fieldTitle: 'Type of organisation',
//         responseType: 'Dropdown',
//         validation: null,
//       },
//       {
//         questionId: 'APPLICANT_ORG_NAME',
//         fieldTitle: 'Name',
//         responseType: 'ShortAnswer',
//         validation: null,
//       },
//       {
//         questionId: 'APPLICANT_ORG_ADDRESS',
//         fieldTitle: 'Address',
//         responseType: 'AddressInput',
//         validation: null,
//       },
//       {
//         questionId: 'APPLICANT_ORG_CHARITY_NUMBER',
//         fieldTitle: 'Enter your Charity Commission number',
//         responseType: 'ShortAnswer',
//         validation: null,
//       },
//       {
//         questionId: 'APPLICANT_ORG_COMPANIES_HOUSE',
//         fieldTitle: 'Enter your Companies House number',
//         responseType: 'ShortAnswer',
//         validation: null,
//       },
//     ],
//     [
//       {
//         questionId: 'APPLICANT_AMOUNT',
//         fieldTitle: 'How much does your organisation require as a grant?',
//         responseType: 'Numeric',
//         validation: null,
//       },
//       {
//         questionId: 'BENEFITIARY_LOCATION',
//         fieldTitle: 'Where will this funding be spent?',
//         responseType: 'MultipleSelection',
//         validation: null,
//       },
//     ],
//     [
//       {
//         questionId: '81c761d7-4174-4594-b747-df606d2a582c',
//         fieldTitle: 'Test q',
//         responseType: 'ShortAnswer',
//         validation: null,
//       },
//     ],
//   ];
// };
// const mockSectionData = [
//   {
//     sectionId: 'ELIGIBILITY',
//     sectionTitle: 'Eligibility',
//     sectionStatus: 'COMPLETED',
//     questionIds: ['ELIGIBILITY'],
//     questions: getMockQuestionData()[0],
//   },
//   {
//     sectionId: 'ORGANISATION_DETAILS',
//     sectionTitle: 'Your organisation',
//     sectionStatus: 'COMPLETED',
//     questionIds: [
//       'APPLICANT_TYPE',
//       'APPLICANT_ORG_NAME',
//       'APPLICANT_ORG_ADDRESS',
//       'APPLICANT_ORG_CHARITY_NUMBER',
//       'APPLICANT_ORG_COMPANIES_HOUSE',
//     ],
//     questions: getMockQuestionData()[1],
//   },
//   {
//     sectionId: 'FUNDING_DETAILS',
//     sectionTitle: 'Funding',
//     sectionStatus: 'IN_PROGRESS',
//     questionIds: ['APPLICANT_AMOUNT', 'BENEFITIARY_LOCATION'],
//     questions: getMockQuestionData()[2],
//   },
//   {
//     sectionId: 'TEST_SECTION',
//     sectionTitle: 'Test Q',
//     sectionStatus: 'IN_PROGRESS',
//     questionIds: ['81c761d7-4174-4594-b747-df606d2a582c'],
//     questions: getMockQuestionData()[3],
//   },
// ];

const contextNoToken = {
  params: {
    submissionId: '12345678',
  },
  req: {},
  res: {
    getHeader: () => '',
  },
} as unknown as GetServerSidePropsContext;

const shortAnswer: QuestionType = {
  questionId: 'APPLICANT_ORG_NAME',
  fieldTitle: 'Enter the name of your organisation',
};

const numeric: QuestionType = {
  questionId: 'APPLICANT_AMOUNT',
  fieldTitle: 'Enter the amount',
};

const eligibility: QuestionType = {
  questionId: 'ELIGIBILITY',
  fieldTitle: 'Enter the amount',
};

const propsWithAllValues: ApplicationDetailsInterface = {
  grantApplicationId: 'string',
  grantSubmissionId: 'test',
  applicationName: 'Name of the grant being applied for',
  sections: [
    {
      sectionId: 'ELIGIBILITY',
      sectionTitle: 'Eligibility',
      sectionStatus: 'COMPLETED',
      questionIds: [eligibility].map((q) => q.questionId),
      questions: [eligibility],
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

  it('Should return hydrated sections, application name, and grantSubmissionId', async () => {
    mockGetSubmissionById.mockResolvedValue(propsWithAllValues);
    mockGetJwtFromCookies.mockReturnValue('testJwt');

    const response = await getServerSideProps(context);
    expect(response).toEqual({
      props: {
        sections: propsWithAllValues.sections,
        grantSubmissionId: propsWithAllValues.grantSubmissionId,
        applicationName: propsWithAllValues.applicationName,
      },
    });
    expect(getSubmissionById).toHaveBeenCalled();
    expect(getSubmissionById).toHaveBeenCalledWith(
      context.params.submissionId,
      'testJwt'
    );
  });

  it('Should return error (or something suitable) if submissionId is INVALID', async () => {
    //mock getSubmissionById (WITH INVALID MOCK SUBMISSION ID)
    mockGetSubmissionById.mockRejectedValue({});
    mockGetJwtFromCookies.mockReturnValue('testJwt');

    const response = await getServerSideProps(context);
    expect(response).toStrictEqual({
      redirect: {
        destination:
          '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to view the application overview.","linkAttributes":{"href":"/submissions/12345678/section-overview","linkText":"Please return","linkInformation":" and try again."}}',
        statusCode: 302,
      },
    });
  });
});

describe('Renders the section summary correctly', () => {
  it('should render all sections correctly', () => {
    render(<SectionOverview {...propsWithAllValues} />);

    //name of application and overview
    expect(
      screen.getByText(propsWithAllValues.applicationName)
    ).toBeInTheDocument();
    expect(
      screen.getByText('Overview of application questions')
    ).toBeInTheDocument();

    //check section titles rendering
    propsWithAllValues.sections.map((section) => {
      expect(screen.getByText(section.sectionTitle)).toBeInTheDocument();
    });
    expect(
      screen.getAllByText('In this section, you will be asked:')
    ).toHaveLength(2);

    //check questions rendering
    expect(screen.getAllByText('Enter the amount')).toHaveLength(2);

    expect(
      screen.getByText('Enter the name of your organisation')
    ).toBeInTheDocument();
  });

  it('Renders return to profile button and back buttton', () => {
    render(<SectionOverview {...propsWithAllValues} />);
    expect(
      screen.getByRole('link', { name: 'Return to application form' })
    ).toHaveAttribute('href', `/submissions/test/sections`);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
      'href',
      `http://localhost/submissions/test/sections`
    );
  });
});

describe('Renders a single section', () => {
  it('Should render SingleSection component with mock ELIGIBILITY section data', () => {
    render(<SingleSection {...propsWithAllValues.sections[0]} />);

    expect(screen.getByText('Eligibility')).toBeInTheDocument();
    expect(screen.getByText('Enter the amount')).toBeInTheDocument();

    //assert that data from NON-ESSENTIAL section does not render
    expect(screen.queryByText('Non Essential Information')).toBeNull();
    expect(screen.getAllByText('Enter the amount')).not.toHaveLength(2);
    expect(
      screen.queryByText('Enter the name of your organisation')
    ).toBeNull();
  });
  it('Should render SingleSection component with mock NON-ESSENTIAL section data', () => {
    render(<SingleSection {...propsWithAllValues.sections[1]} />);

    expect(screen.getByText('Non Essential Information')).toBeInTheDocument();
    expect(screen.getByText('Enter the amount')).toBeInTheDocument();
    expect(
      screen.getByText('Enter the name of your organisation')
    ).toBeInTheDocument();

    //assert that data from NON-ESSENTIAL section does not render
    expect(screen.queryByText('Eligibility')).toBeNull();
    expect(screen.getAllByText('Enter the amount')).not.toHaveLength(2);
  });
});
