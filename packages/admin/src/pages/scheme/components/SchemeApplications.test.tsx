import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import SchemeApplications, {
  SchemeApplicationsProps,
} from './SchemeApplications';

const getSchemeApplicationsProps = (overrides: any = {}) =>
  merge(
    {
      applicationName: 'Test application name',
      audit: {
        created: '2022-01-03T00:00:00.00Z',
        lastPublished: '2022-01-04T00:00:00.00Z',
        lastUpdated: '2022-01-05T00:00:00.00Z',
      },
    },
    overrides
  );

const getApplicationFormStats = (overrides: any = {}) =>
  merge(
    {
      applicationId: 1,
      inProgressCount: 0,
      submissionCount: 0,
    },
    overrides
  );

const SCHEME_VERSION = '1';

const renderComponent = (overrideProps?: Partial<SchemeApplicationsProps>) => {
  const props = {
    applicationForm: getSchemeApplicationsProps(),
    applicationFormStats: getApplicationFormStats(),
    schemeVersion: SCHEME_VERSION,
    editorOrPublisherEmail: '',
    ...overrideProps,
  };
  render(<SchemeApplications {...props} />);
};

describe('BuildApplicationForm', () => {
  it('Should render a application form name table col', () => {
    renderComponent({ editorOrPublisherEmail: 'test@test.gov' });

    screen.getByRole('cell', {
      name: 'View application: Test application name',
    });
    screen.getByRole('cell', {
      name: '4 January 2022, 12:00am (test@test.gov)',
    });
    screen.getByRole('cell', { name: '3 January 2022, 12:00am' });
  });

  it('Should render a last updated date when there is no published date', () => {
    renderComponent({
      editorOrPublisherEmail: 'test@test.gov',
      applicationForm: getSchemeApplicationsProps({
        audit: { lastPublished: '' },
      }),
    });

    screen.getByRole('cell', {
      name: '5 January 2022, 12:00am (test@test.gov)',
    });
  });

  it('Should render a last updated date when there is a published date and the application status is "UNPUBLISHED"', () => {
    renderComponent({
      editorOrPublisherEmail: 'test@test.gov',
      applicationForm: getSchemeApplicationsProps({
        applicationStatus: 'REMOVED',
      }),
    });

    screen.getByRole('cell', {
      name: '5 January 2022, 12:00am (test@test.gov)',
    });
  });

  it('Should render a application form view table col', () => {
    renderComponent();

    screen.getByRole('link', {
      name: 'View application: Test application name',
    });
  });

  it('Should render a "View submitted applications" heading', () => {
    renderComponent();

    screen.getByRole('heading', { name: 'View submitted applications' });
  });

  it('Should render a summary of the view submitted applications action', () => {
    renderComponent({
      applicationFormStats: getApplicationFormStats({ submissionCount: 1 }),
    });

    screen.getByText(
      'To see who has applied for your grant, you need to view and download your submitted applications.'
    );
  });

  it('Should render a summary of the view submitted applications action alternative text', () => {
    renderComponent();

    screen.getByText('No applications have been submitted.');
  });

  it('Should render In progress row within application submissions summary table', () => {
    renderComponent({
      applicationFormStats: getApplicationFormStats({ inProgressCount: 123 }),
    });

    screen.getByRole('cell', { name: 'In progress' });
    screen.getByRole('cell', { name: '123' });
  });

  it('Should render In progress row within application submissions summary table', () => {
    renderComponent({
      applicationFormStats: getApplicationFormStats({ submissionCount: 456 }),
    });

    screen.getByRole('cell', { name: 'Submitted' });
    screen.getByRole('cell', { name: '456' });
  });

  it('Should render 0 if there are no submissions in progress or submitted', () => {
    renderComponent();

    const cells = screen.getAllByRole('cell', { name: '0' });
    expect(cells.length).toBe(2);
  });

  it('Should render a "View submitted applications" button', () => {
    renderComponent({
      applicationFormStats: getApplicationFormStats({ submissionCount: 1 }),
    });

    expect(
      screen.getByRole('button', { name: 'View submitted applications' })
    ).toHaveAttribute('aria-disabled', 'false');
  });

  it('Should render a "View submitted applications" button as disabled when application has no submissions', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'View submitted applications' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('Should render a "Required checks" heading', () => {
    renderComponent();

    screen.getByRole('heading', { name: 'Required checks' });
  });

  it('Should render a summary of the view submitted applications action', () => {
    renderComponent();

    screen.getByText(
      "Download the information from the 'Required checks' section of the application form only."
    );
    screen.getByText(
      'You can use this information to carry out due-diligence checks.'
    );
  });

  it('Should render a link to direct admins to spotlight', () => {
    renderComponent();

    screen.getByRole('link', {
      name: 'You can use the Cabinet Office service Spotlight for these checks.',
    });
  });

  it('Should render a "View submitted applications" button', () => {
    renderComponent({
      applicationFormStats: getApplicationFormStats({ submissionCount: 1 }),
    });

    expect(
      screen.getByRole('button', { name: 'Download required checks' })
    ).not.toHaveAttribute('disabled');
  });

  it('Should render a disabled "Download required checks" button', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: 'Download required checks' })
    ).toHaveAttribute('disabled');
  });

  it('Should not render "Download required checks" section for V2 schemes', () => {
    renderComponent({ schemeVersion: '2' });

    expect(screen.queryByText(/required checks/)).not.toBeInTheDocument();
  });
});
