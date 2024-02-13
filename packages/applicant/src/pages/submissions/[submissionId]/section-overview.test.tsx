import { GetServerSidePropsContext } from 'next';
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
  questionSuffix: 'Test question suffix for eligibility',
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
    expect(
      screen.getAllByText('Test question suffix for eligibility')
    ).toHaveLength(1);
    expect(screen.getAllByText('Enter the amount')).toHaveLength(1);

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
    expect(
      screen.getByText('Test question suffix for eligibility')
    ).toBeInTheDocument();

    expect(screen.queryByText('Non Essential Information')).toBeNull();
    expect(screen.queryByText('Enter the amount')).toBeNull();
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

    expect(screen.queryByText('Eligibility')).toBeNull();
    expect(
      screen.queryByText('Test question suffix for eligibility')
    ).toBeNull();
  });
});
