import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import { getPageProps, renderWithRouter } from '../../utils/UnitTestHelpers';
import CompaniesHouseNumberPage, {
  getServerSideProps,
} from './companies-house-number.page';

describe('Organisation companies house number page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    organisationId: 'testOrganisationId',
    defaultFields: {
      companiesHouseNumber: '',
    },
  });

  it('should display a heading', () => {
    renderWithRouter(
      <CompaniesHouseNumberPage {...getPageProps(getDefaultProps)} />
    );

    screen.getByRole('heading', {
      name: 'Enter your Companies House number (optional)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <CompaniesHouseNumberPage {...getPageProps(getDefaultProps)} />
    );

    screen.getByText(
      'If your organisation is registered with Companies House, enter your company number below.'
    );
    expect(
      screen.getByRole('link', {
        name: 'Search for your company number (opens in new tab)',
      })
    ).toHaveAttribute(
      'href',
      'https://find-and-update.company-information.service.gov.uk/?_ga=2.111669508.18905375.1663663866-660770501.1644938489'
    );
  });

  it('should display a text input with no default', () => {
    renderWithRouter(
      <CompaniesHouseNumberPage {...getPageProps(getDefaultProps)} />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display a text input with a default', () => {
    renderWithRouter(
      <CompaniesHouseNumberPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            companiesHouseNumber: 'testCompaniesHouseNumber',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'value',
      'testCompaniesHouseNumber'
    );
  });
});
