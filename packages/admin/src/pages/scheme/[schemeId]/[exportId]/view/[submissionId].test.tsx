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

const SCHEME_ID = 'testSchemeId';
const EXPORT_ID = 'testExportId';

const context = {
  params: {
    schemeId: SCHEME_ID,
    exportId: EXPORT_ID,
  } as Record<string, string>,
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

const backBtnUrl = `/scheme/${SCHEME_ID}/${EXPORT_ID}`;

const propsWithAllValues = {
  backButtonHref: backBtnUrl,
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
      `http://localhost/apply${backBtnUrl}`
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

  it('renders download section correctly if there are attachments to download', () => {
    const attachmentsZipLocation = 'testZipLocation';
    const propsWithAttachments = {
      ...propsWithAllValues,
      submission: { ...submission, attachmentsZipLocation },
    };
    render(<SubmissionSummary {...propsWithAttachments} />);

    expect(screen.getByText('Download attachments')).toBeInTheDocument();
    expect(
      screen.getByText(
        'download a copy of any files attached to this application (ZIP).'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Return to overview')).toHaveAttribute(
      'href',
      `/apply${backBtnUrl}`
    );
  });

  it('does not render download section if there are no attachments to download', () => {
    render(<SubmissionSummary {...propsWithAllValues} />);

    expect(screen.queryByText('Download attachments')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'download a copy of any files attached to this application (ZIP).'
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Return to overview')).not.toBeInTheDocument();
  });
});
