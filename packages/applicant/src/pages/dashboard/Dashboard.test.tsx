import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DescriptionListProps } from '../../components/description-list/DescriptionList';
import { routes } from '../../utils/routes';
import { ApplicantDashboard } from './Dashboard';

const descriptionList: DescriptionListProps = {
  data: [
    { term: 'Name', detail: 'Sarah Philips' },
    { term: 'Organisation', detail: 'ABC Charity' },
  ],
  needAddOrChangeButtons: false,
  needBorder: false,
};

describe('Dashboard', () => {
  beforeEach(() => {
    render(
      <ApplicantDashboard
        descriptionList={descriptionList}
        hasApplications={true}
      />
    );
  });

  test('should render 2 <hr/>', () => {
    const line = screen.getAllByRole('separator');
    expect(line.length).toBe(2);
  });

  describe('should render first section', () => {
    test('should render heading', () => {
      const heading = screen.getByRole('heading', {
        name: /your account/i,
      });
      expect(heading).toBeInTheDocument();
    });
    test('should render table element', () => {
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
      const heading = screen.getByRole('heading', {
        name: /view your applications/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test('should render table element', () => {
      const text = screen.getByText(/see your past and current applications/i);
      expect(text).toBeInTheDocument();
    });

    test('should render the link element and have the right href', () => {
      expect(
        screen.getByRole('link', { name: /view your applications/i })
      ).toHaveAttribute('href', '/applications');
    });
  });

  describe('should render second section when applicant has no applications', () => {
    beforeEach(() => {
      render(
        <ApplicantDashboard
          descriptionList={descriptionList}
          hasApplications={false}
        />
      );
    });

    test('should render paragraphs', () => {
      screen.getByText(/You have not started any applications\./i);
      screen.getByText(
        /To get started, you need to find a grant that you want to apply for\./i
      );
    });

    test('should find a grant button with correct href', () => {
      expect(
        screen.getByRole('button', { name: /find a grant/i })
      ).toHaveAttribute('href', routes.findAGrant);
    });
  });

  describe('should render third section', () => {
    test('should render heading', () => {
      const heading = screen.getByRole('heading', {
        name: /your details/i,
      });
      expect(heading).toBeInTheDocument();
    });

    test('should render the 2 cards', () => {
      const organisationCard = screen.getByText(
        /Change your organisation details/i
      );
      expect(organisationCard).toBeInTheDocument();
    });
  });
});
