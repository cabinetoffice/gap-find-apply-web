import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import SchemeApplications from './SchemeApplications';

const getSchemeApplicationsProps = (overrides: any = {}) =>
  merge(
    {
      applicationName: 'Test application name',
      audit: {
        created: '2022-01-03T00:00:00.00Z',
        lastPublished: '2022-01-04T00:00:00.00Z',
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

describe('BuildApplicationForm', () => {
  it('Should render a application form name table col', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: 'Test application name' });
  });

  it('Should render a application form date created table col', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: '3 January 2022' });
  });

  it('Should render a application form date published table col', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: '4 January 2022' });
  });

  it('Should render a "-" when there is no published date', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps({
          audit: { lastPublished: '' },
        })}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: '-' });
  });

  it('Should render a "-" when there is a published date and the application status is "UNPUBLISHED"', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps({
          applicationStatus: 'REMOVED',
        })}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: '-' });
  });

  it('Should render a application form view table col', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('link', {
      name: 'View application: Test application name',
    });
  });

  it('Should render a "View submitted applications" heading', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('heading', { name: 'View submitted applications' });
  });

  it('Should render a summary of the view submitted applications action', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats({ submissionCount: 1 })}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByText(
      'To see who has applied for your grant, you need to view and download your submitted applications.'
    );
  });

  it('Should render a summary of the view submitted applications action alternative text', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByText('No applications have been submitted.');
  });

  it('Should render In progress row within application submissions summary table', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats({ inProgressCount: 123 })}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: 'In progress' });
    screen.getByRole('cell', { name: '123' });
  });

  it('Should render In progress row within application submissions summary table', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats({ submissionCount: 456 })}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('cell', { name: 'Submitted' });
    screen.getByRole('cell', { name: '456' });
  });

  it('Should render 0 if there are no submissions in progress or submitted', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    const cells = screen.getAllByRole('cell', { name: '0' });
    expect(cells.length).toBe(2);
  });

  it('Should render a "View submitted applications" button', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats({ submissionCount: 1 })}
        schemeVersion={SCHEME_VERSION}
      />
    );

    expect(
      screen.getByRole('button', { name: 'View submitted applications' })
    ).toHaveAttribute('aria-disabled', 'false');
  });

  it('Should render a "View submitted applications" button as disabled when application has no submissions', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    expect(
      screen.getByRole('button', { name: 'View submitted applications' })
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('Should render a "Required checks" heading', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('heading', { name: 'Required checks' });
  });

  it('Should render a summary of the view submitted applications action', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByText(
      "Download the information from the 'Required checks' section of the application form only."
    );
    screen.getByText(
      'You can use this information to carry out due-diligence checks.'
    );
  });

  it('Should render a link to direct admins to spotlight', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    screen.getByRole('link', {
      name: 'You can use the Cabinet Office service Spotlight for these checks.',
    });
  });

  it('Should render a "View submitted applications" button', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats({ submissionCount: 1 })}
        schemeVersion={SCHEME_VERSION}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Download required checks' })
    ).not.toHaveAttribute('disabled');
  });

  it('Should render a disabled "Download required checks" button', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={SCHEME_VERSION}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Download required checks' })
    ).toHaveAttribute('disabled');
  });

  it('Should not render "Download required checks" section for V2 schemes', () => {
    render(
      <SchemeApplications
        applicationForm={getSchemeApplicationsProps()}
        applicationFormStats={getApplicationFormStats()}
        schemeVersion={'2'}
      />
    );

    expect(screen.queryByText(/required checks/)).not.toBeInTheDocument();
  });
});
