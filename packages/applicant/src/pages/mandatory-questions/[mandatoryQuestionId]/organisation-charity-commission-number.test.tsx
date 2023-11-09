import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationCharityCommissionNumberPage, {
  getServerSideProps,
} from './organisation-charity-commission-number.page';

describe('Organisation Charity Commission Number page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      charityCommissionNumber: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCharityCommissionNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter your Charity Commission number (if you have one)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCharityCommissionNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByText(
      'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.'
    );
    screen.getByText('Search for your charity number (opens in new tab)');
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCharityCommissionNumberPage
        {...getPageProps(getDefaultProps)}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationCharityCommissionNumberPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            charityCommissionNumber: '1234',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '1234');
  });
});
