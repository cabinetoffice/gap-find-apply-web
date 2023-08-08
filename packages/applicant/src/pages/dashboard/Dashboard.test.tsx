import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import { routes } from '../../utils/routes';
import { ApplicantDashBoardProps, ApplicantDashboard } from './Dashboard';
import { getProps } from 'gap-web-ui';

const descriptionList: DescriptionListProps = {
  data: [
    { term: 'Name', detail: 'Sarah Philips' },
    { term: 'Organisation', detail: 'ABC Charity' },
  ],
  needAddOrChangeButtons: false,
  needBorder: false,
};

function getDefaultProps(): ApplicantDashBoardProps {
  return {
    descriptionList: descriptionList,
    hasApplications: true,
    showMigrationErrorBanner: false,
    showMigrationSuccessBanner: false,
  };
}

describe('Dashboard', () => {
  test('should render first section', () => {
    render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

    screen.getByRole('heading', {
      name: /your account/i,
    });
    screen.getByRole('term', {
      name: /name/i,
    });
    screen.getByText(/Sarah philips/i);
    screen.getByRole('term', {
      name: /organisation/i,
    });
    screen.getByText(/ABC Charity/i);
    screen.getByRole('heading', {
      name: /view your applications/i,
    });
    screen.getByText(/see your past and current applications/i);
    expect(
      screen.getByRole('link', { name: /view your applications/i })
    ).toHaveAttribute('href', '/applications');
  });

  describe('should render second section when applicant has no applications', () => {
    test('should render paragraphs', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, { hasApplications: false })}
        />
      );

      screen.getByRole('heading', {
        name: /your details/i,
      });
      screen.getByText(/You have not started any applications\./i);
      screen.getByText(
        /To get started, you need to find a grant that you want to apply for\./i
      );
      expect(
        screen.getByRole('button', { name: /find a grant/i })
      ).toHaveAttribute('href', routes.findAGrant);
      screen.getByText(/Change your organisation details/i);
    });
  });

  describe('migration journey feature flag', () => {
    test(`renders error banner when migrationSucceeded is 'false'`, () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, {
            showMigrationErrorBanner: true,
          })}
        />
      );

      screen.getByRole('heading', { level: 2, name: 'Important' });
      screen.getByText('Something went wrong while transferring your data.');
      expect(
        screen.getByRole('link', {
          name: 'findagrant@cabinetoffice.gov.uk',
        })
      ).toHaveAttribute('href', 'mailto:findagrant@cabinetoffice.gov.uk');
    });

    test('Should not render the error banner', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.queryByRole('heading', { level: 2, name: 'Important' })
      ).toBeFalsy();
    });

    test('Should render the success banner', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, {
            showMigrationSuccessBanner: true,
          })}
        />
      );

      screen.getByRole('heading', { level: 2, name: 'Success' });
      screen.getByText(
        'Your data has been successfully added to your One Login account.'
      );
    });

    test('Should not render the success banner', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.queryByRole('heading', { level: 2, name: 'Success' })
      ).toBeFalsy();
    });
  });
});
