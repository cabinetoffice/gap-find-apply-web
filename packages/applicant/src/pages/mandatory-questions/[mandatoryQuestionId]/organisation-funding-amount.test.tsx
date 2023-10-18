import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationFundingAmountPage, {
  getServerSideProps,
} from './organisation-funding-amount.page';

describe('Organisation name page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      fundingAmount: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingAmountPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'How much funding are you applying for?',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingAmountPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByText('Please enter whole pounds only');
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingAmountPage
        {...getPageProps(getDefaultProps)}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingAmountPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            fundingAmount: '1234',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '1234');
  });
});
