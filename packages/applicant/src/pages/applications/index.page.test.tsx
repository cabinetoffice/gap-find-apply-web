import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
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

  it('should render the table if values are provided', () => {
    expect(screen.getAllByRole('row')).toHaveLength(4);
    expect(screen.getAllByRole('rowheader')).toHaveLength(3);

    expect(screen.getByRole('row', { name: 'Name of grant' })).toBeDefined();

    expect(screen.getByRole('link', { name: 'Application 1' })).toHaveProperty(
      'href',
      'http://localhost/apply/applicant/submissions/subId1/sections'
    );
    expect(screen.getByRole('link', { name: 'Application 2' })).toHaveProperty(
      'href',
      'http://localhost/apply/applicant/submissions/subId2/sections'
    );
    expect(screen.getByRole('link', { name: 'Application 3' })).toHaveProperty(
      'href',
      'http://localhost/apply/applicant/submissions/subId3/sections'
    );
  });
});

describe('Renders conditional links', () => {
  it('should render the application link as text if the application has been submitted', () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/applications`,
        })}
      >
        <ExistingApplications applicationData={MockApplicationDataSubmitted} />
      </RouterContext.Provider>
    );
    expect(screen.getAllByRole('row')).toHaveLength(2);
    expect(screen.getAllByRole('rowheader')).toHaveLength(1);

    expect(screen.getByRole('row', { name: 'Name of grant' })).toBeDefined();

    expect(
      screen.getByRole('rowheader', { name: 'Application 1' })
    ).not.toHaveProperty(
      'href',
      'http://localhost/submissions/subId1/sections'
    );
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
