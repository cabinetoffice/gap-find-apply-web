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
    oneLoginMatchingAccountBannerEnabled: false,
  };
}

describe('Dashboard', () => {
  test('should render 2 <hr/>', () => {
    render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

    const line = screen.getAllByRole('separator');
    expect(line.length).toBe(2);
  });

  describe('should render first section', () => {
    test('should render heading', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      const heading = screen.getByRole('heading', {
        name: /your account/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test('should render table element', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      const nameKey = screen.getByRole('term', {
        name: /name/i,
      });
      const nameValue = screen.getByText(/Sarah philips/i);

      const organisationKey = screen.getByRole('term', {
        name: /organisation/i,
      });

      const organisationValue = screen.getByText(/ABC Charity/i);

      expect(nameKey).toBeInTheDocument();
      expect(nameValue).toBeInTheDocument();
      expect(organisationKey).toBeInTheDocument();
      expect(organisationValue).toBeInTheDocument();
    });
  });

  describe('should render second section', () => {
    test('should render heading', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      const heading = screen.getByRole('heading', {
        name: /view your applications/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test('should render table element', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      const text = screen.getByText(/see your past and current applications/i);
      expect(text).toBeInTheDocument();
    });

    test('should render the link element and have the right href', () => {
      render(<ApplicantDashboard {...getProps(getDefaultProps)} />);

      expect(
        screen.getByRole('link', { name: /view your applications/i })
      ).toHaveAttribute('href', '/applications');
    });
  });

  describe('should render second section when applicant has no applications', () => {
    test('should render paragraphs', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, { hasApplications: false })}
        />
      );

      screen.getByText(/You have not started any applications\./i);
      screen.getByText(
        /To get started, you need to find a grant that you want to apply for\./i
      );
    });

    test('should find a grant button with correct href', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, { hasApplications: false })}
        />
      );

      expect(
        screen.getByRole('button', { name: /find a grant/i })
      ).toHaveAttribute('href', routes.findAGrant);
    });
  });

  describe('should render third section', () => {
    test('should render heading', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, { hasApplications: false })}
        />
      );

      const heading = screen.getByRole('heading', {
        name: /your details/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test('should render the 2 cards', () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, { hasApplications: false })}
        />
      );

      const organisationCard = screen.getByText(
        /Change your organisation details/i
      );
      expect(organisationCard).toBeInTheDocument();
    });
  });

  describe('migration journey feature flag', () => {
    test(`renders error banner when migrationSucceeded is 'false'`, () => {
      render(
        <ApplicantDashboard
          {...getProps(getDefaultProps, {
            oneLoginMatchingAccountBannerEnabled: true,
            migrationSucceeded: 'false',
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
            oneLoginMatchingAccountBannerEnabled: true,
            migrationSucceeded: 'true',
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
