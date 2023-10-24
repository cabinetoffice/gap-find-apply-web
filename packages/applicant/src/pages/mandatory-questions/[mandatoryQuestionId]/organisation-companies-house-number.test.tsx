import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationCompaniesHouseNumberPage, {
  getServerSideProps,
} from './organisation-companies-house-number.page';

describe('Organisation Companies House Number page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      companiesHouseNumber: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCompaniesHouseNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter your Companies House number (if you have one)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCompaniesHouseNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByText(
      'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.'
    );
    screen.getByText('Search for your company number (opens in new tab)');
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCompaniesHouseNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCompaniesHouseNumberPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            companiesHouseNumber: '1234',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '1234');
  });
});
