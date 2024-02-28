import { GetServerSidePropsContext } from 'next';
import { getSubmissionBySubmissionId } from '../../../../../services/SubmissionsService';
import { getLoggedInUsersDetails } from '../../../../../services/UserService';
import SubmissionSummary, { getServerSideProps } from './[submissionId].page';
import { render, screen } from '@testing-library/react';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import { generateErrorPageRedirect } from '../../../../../utils/serviceErrorHelpers';
import { getFailedExportDetails } from '../../../../../services/ExportService';

jest.mock('../../../../../services/SubmissionsService');
jest.mock('../../../../../services/UserService');
jest.mock('../../../../../services/ExportService');
jest.mock('../../../../../utils/session');
jest.mock('../../../../../utils/serviceErrorHelpers');

const mockGetFailedExportDetails = jest.mocked(getFailedExportDetails);
const mockGetLoggedInUserDetails = jest.mocked(getLoggedInUsersDetails);
const mockGetSessionIdFromCookies = jest.mocked(getSessionIdFromCookies);
const mockGenerateErrorPageRedirect = jest.mocked(generateErrorPageRedirect);

const userDetails = {
  firstName: 'John',
  lastName: 'Doe',
  organisationName: 'Example Organisation',
  emailAddress: 'email@email.com',
  roles: 'admin',
  created: '2022-01-01',
};

const submission = {
  schemeName: 'Example Scheme',
  sections: [
    {
      sectionId: '1',
      sectionTitle: 'Section 1',
      sectionStatus: 'Completed',
      questionIds: ['1', '2'],
      questions: [
        {
          questionId: '1',
          fieldTitle: 'Question 1',
          responseType: 'Text',
          response: 'Answer 1',
        },
        {
          questionId: '2',
          fieldTitle: 'Question 2',
          responseType: 'Text',
          response: 'Answer 2',
        },
      ],
    },
    {
      sectionId: '2',
      sectionTitle: 'Section 2',
      sectionStatus: 'Incomplete',
      questionIds: ['3', '4'],
      questions: [
        {
          questionId: '3',
          fieldTitle: 'Question 3',
          responseType: 'Text',
          response: 'Answer 3',
        },
        {
          questionId: '4',
          fieldTitle: 'Question 4',
          responseType: 'Text',
          response: 'Answer 4',
        },
      ],
    },
  ],
};

const context = {
  query: {
    schemeId: '123',
    exportId: '456',
    submissionId: '12345678',
  },
  req: {
    headers: {
      referer: 'testReferer',
    },
  },
  res: {
    getHeader: () => 'testCSRFToken',
  },
} as unknown as GetServerSidePropsContext;

const propsWithAllValues = {
  backButtonHref: '/scheme/123/download-submissions',
  csrfToken: 'csrf',
  userDetails: {
    firstName: 'John',
    lastName: 'Doe',
    organisationName: 'Example Organisation',
    emailAddress: 'email@email.com',
    roles: 'admin',
    created: '2022-01-01',
  },
  submission: {
    schemeName: 'Example Scheme',
    sections: [
      {
        sectionId: '1',
        sectionTitle: 'Section 1',
        sectionStatus: 'Completed',
        questionIds: ['1', '2'],
        questions: [
          {
            questionId: '1',
            fieldTitle: 'Question 1',
            responseType: 'Text',
            response: 'Answer 1',
          },
          {
            questionId: '2',
            fieldTitle: 'Question 2',
            responseType: 'Text',
            response: 'Answer 2',
          },
        ],
      },
      {
        sectionId: '2',
        sectionTitle: 'Section 2',
        sectionStatus: 'Incomplete',
        questionIds: ['3', '4'],
        questions: [
          {
            questionId: '3',
            fieldTitle: 'Question 3',
            responseType: 'Text',
            response: 'Answer 3',
          },
          {
            questionId: '4',
            fieldTitle: 'Question 4',
            responseType: 'Text',
            response: '',
            multiResponse: [
              'multiResponse 1',
              'multiResponse 2',
              'multiResponse 3',
            ],
          },
        ],
      },
    ],
  },
};

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return userDetails and submission', async () => {
    mockGetLoggedInUserDetails.mockResolvedValue(userDetails);
    mockGetFailedExportDetails.mockResolvedValue(submission);
    mockGetSessionIdFromCookies.mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        backButtonHref: '/scheme/123/456',
        csrfToken: 'testCSRFToken',
        userDetails,
        submission,
      },
    });
    expect(getSessionIdFromCookies).toHaveBeenCalledWith(context.req);
    expect(getLoggedInUsersDetails).toHaveBeenCalledWith('testJwt');
    expect(getFailedExportDetails).toHaveBeenCalledWith(
      '456',
      '12345678',
      'testJwt'
    );
  });

  it('should return error page redirect if getLoggedInUsersDetails throws an error', async () => {
    mockGetSessionIdFromCookies.mockReturnValue('testJwt');
    mockGetLoggedInUserDetails.mockRejectedValue(new Error('Test error'));
    mockGenerateErrorPageRedirect.mockReturnValue({
      redirect: { destination: 'testDestination', statusCode: 302 },
    });

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      redirect: {
        destination: 'testDestination',
        statusCode: 302,
      },
    });
    expect(getSessionIdFromCookies).toHaveBeenCalledWith(context.req);
    expect(getLoggedInUsersDetails).toHaveBeenCalledWith('testJwt');
    expect(getSubmissionBySubmissionId).not.toHaveBeenCalled();
  });
});

describe('SubmissionSummary', () => {
  it('renders SubmissionSummary component and back link correctly', () => {
    render(<SubmissionSummary {...propsWithAllValues} />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
      'href',
      `http://localhost/apply/scheme/123/download-submissions`
    );
  });

  it('renders scheme name, organisation name, and section titles correctly', () => {
    render(<SubmissionSummary {...propsWithAllValues} />);

    expect(screen.getByText('Example Scheme')).toBeInTheDocument();
    expect(screen.getByText('Example Organisation')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('renders questions and answers correctly', () => {
    render(<SubmissionSummary {...propsWithAllValues} />);

    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Question 3')).toBeInTheDocument();
    expect(screen.getByText('Question 4')).toBeInTheDocument();

    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
    expect(screen.getByText('Answer 3')).toBeInTheDocument();
    expect(screen.getByText('multiResponse 1,')).toBeInTheDocument();
    expect(screen.getByText('multiResponse 2,')).toBeInTheDocument();
    expect(screen.getByText('multiResponse 3')).toBeInTheDocument();
  });
});
