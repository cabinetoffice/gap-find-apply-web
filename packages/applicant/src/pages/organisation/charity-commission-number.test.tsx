import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import {
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import CharityCommissionNumberPage, {
  getServerSideProps,
} from './charity-commission-number.page';

describe('Organisation charity commission number page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    organisationId: 'testOrganisationId',
    defaultFields: {
      charityCommissionNumber: '',
    },
  });

  it('should display a heading', () => {
    renderWithRouter(
      <CharityCommissionNumberPage {...getPageProps(getDefaultProps)} />
    );

    screen.getByRole('heading', {
      name: 'Enter your Charity Commission number (optional)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <CharityCommissionNumberPage {...getPageProps(getDefaultProps)} />
    );

    screen.getByText(
      'If your organisation is registered with the Charity Commission, enter your charity number below.'
    );
    expect(
      screen.getByRole('link', {
        name: 'Search for your charity number (opens in new tab)',
      })
    ).toHaveAttribute(
      'href',
      'https://register-of-charities.charitycommission.gov.uk/charity-search'
    );
  });

  it('should display a text input with no default', () => {
    renderWithRouter(
      <CharityCommissionNumberPage {...getPageProps(getDefaultProps)} />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display a text input with a default', () => {
    renderWithRouter(
      <CharityCommissionNumberPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            charityCommissionNumber: 'testCharityCommissionNumber',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'value',
      'testCharityCommissionNumber'
    );
  });
});
