import '@testing-library/jest-dom';
import { getQueriesForElement, render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { getApplicationsListById } from '../../services/ApplicationService';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../utils/jwt';
import ExistingApplications, { getServerSideProps } from './index.page';

jest.mock('../../services/ApplicationService');
jest.mock('../../utils/jwt');

const MockApplicationData = [
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId1',
    applicationName: 'Application 1',
    submissionStatus: 'IN_PROGRESS',
    submittedDate: null,
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId2',
    applicationName: 'Application 2',
    submissionStatus: 'IN_PROGRESS',
    submittedDate: null,
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId3',
    applicationName: 'Application 3',
    submissionStatus: 'IN_PROGRESS',
    submittedDate: null,
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
];

const MockApplicationDataSubmitted = [
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId1',
    applicationName: 'Application 1',
    submissionStatus: 'SUBMITTED',
    submittedDate: '2024-01-15T13:36:06.861109Z',
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
];

const MockApplicationDataGrantClosed = [
  {
    grantSchemeId: 'string',
    grantApplicationId: 'string',
    grantSubmissionId: 'subId1',
    applicationName: 'Application 1',
    submissionStatus: 'GRANT_CLOSED',
    submittedDate: null,
    sections: [
      {
        sectionId: 'string',
        sectionTitle: 'string',
        sectionStatus: 'string',
      },
    ],
  },
];

const context = {
  params: {},
} as unknown as GetServerSidePropsContext;
const props = {
  applicationData: MockApplicationData,
};

const getRow = (name: string) =>
  screen.getByRole('rowheader', { name }).closest('tr');
const getActionForRow = (row: HTMLElement, name: string) =>
  getQueriesForElement(row).getByRole('link', { name });
const getTextForRow = (row: HTMLElement, text: string) =>
  getQueriesForElement(row).getByText(text);

const assertHasAllHeaders = () => {
  expect(screen.getByRole('columnheader', { name: 'Grant' })).toBeDefined();
  expect(screen.getByRole('columnheader', { name: 'Status' })).toBeDefined();
  expect(screen.getByRole('columnheader', { name: 'Submitted' })).toBeDefined();
  expect(screen.getByRole('columnheader', { name: 'Actions' })).toBeDefined();
};

describe('getServerSideProps', () => {
  it('should return the correct props', async () => {
    (getApplicationsListById as jest.Mock).mockReturnValue(MockApplicationData);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        applicationData: MockApplicationData,
      },
    });
    expect(getApplicationsListById).toHaveBeenCalled();
    expect(getApplicationsListById).toHaveBeenCalledWith('testJwt');
  });
});

describe('View existing applications', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <ExistingApplications applicationData={props.applicationData} />
      </RouterContext.Provider>
    );
  });

  it('should render a back link with the correct href', () => {
    expect(screen.getByRole('link', { name: 'Back' })).toHaveProperty(
      'href',
      'http://localhost/dashboard'
    );
  });

  it('should render the correct heading and help content', () => {
    expect(screen.getByText('Your applications')).toBeDefined();
    expect(
      screen.getByText(
        'All of your current and past applications are listed below.'
      )
    ).toBeDefined();
  });

  it('should render in progress applications correctly', () => {
    // 1 header + 3 rows
    expect(screen.getAllByRole('row')).toHaveLength(4);
    // 3 rows * 4 columns
    expect(screen.getAllByRole('cell')).toHaveLength(12);

    assertHasAllHeaders();

    MockApplicationData.forEach((submission) => {
      const row = getRow(submission.applicationName);
      const sectionLink = `http://localhost/apply/applicant/submissions/${submission.grantSubmissionId}/sections`;
      expect(getActionForRow(row, 'Edit')).toHaveProperty('href', sectionLink);
      expect(getTextForRow(row, 'In Progress')).toBeInTheDocument();
      expect(getTextForRow(row, '-')).toBeInTheDocument();
    });
  });
});

describe('Submitted applications', () => {
  it('should render submitted applications correctly', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <ExistingApplications applicationData={MockApplicationDataSubmitted} />
      </RouterContext.Provider>
    );
    // 1 header + 1 row
    expect(screen.getAllByRole('row')).toHaveLength(2);
    // 1 row * 4 columns
    expect(screen.getAllByRole('cell')).toHaveLength(4);

    assertHasAllHeaders();

    const row = getRow('Application 1');
    expect(getActionForRow(row, 'View')).toHaveProperty(
      'href',
      'http://localhost/apply/applicant/submissions/subId1/summary'
    );
    expect(getTextForRow(row, 'Submitted')).toBeInTheDocument();
    expect(getTextForRow(row, '15 January 2024')).toBeInTheDocument();
  });
});

describe('Closed applications', () => {
  it('should render closed applications correctly', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <ExistingApplications
          applicationData={MockApplicationDataGrantClosed}
        />
      </RouterContext.Provider>
    );
    // 1 header + 1 row
    expect(screen.getAllByRole('row')).toHaveLength(2);
    // 1 row * 4 columns
    expect(screen.getAllByRole('cell')).toHaveLength(4);

    assertHasAllHeaders();

    const row = getRow('Application 1');
    expect(getTextForRow(row, 'Grant Closed')).toBeInTheDocument();
    expect(getQueriesForElement(row).getAllByText('View')).toHaveLength(1);
    expect(getQueriesForElement(row).queryByRole('link')).toBeInTheDocument();
  });
});

describe('No data for existing applications', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <ExistingApplications applicationData={[]} />
      </RouterContext.Provider>
    );
  });

  it('should render the correct heading and help content', () => {
    expect(screen.getByText('Your applications')).toBeDefined();
    expect(
      screen.getByText(
        'All of your current and past applications are listed below.'
      )
    ).toBeDefined();
    expect(
      screen.getByText('You have not started any applications.')
    ).toBeDefined();
    expect(
      screen.getByText(
        'To get started, you need to find a grant that you want to apply for.'
      )
    ).toBeDefined();
  });

  it('should render the horizontal line', () => {
    expect(screen.getByTestId('horizontal-line')).toHaveClass(
      'govuk-section-break--visible'
    );
  });

  it('should render find a grant link', () => {
    expect(
      screen.getAllByRole('link', {
        name: /find a grant/i,
      })[1]
    ).toHaveAttribute(
      'href',
      'https://www.find-government-grants.service.gov.uk'
    );
  });
});
