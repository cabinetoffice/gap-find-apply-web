import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationSummaryPage, {
  generateMandatoryQuestionDetails,
  getServerSideProps,
} from './organisation-summary.page';

describe('Organisation summary page', () => {
  const mandatoryQuestion = {
    schemeId: 1,
    name: 'Test Organisation',
    addressLine1: 'Test Address 1',
    addressLine2: 'Test Address 2',
    city: 'Test City',
    county: 'Test County',
    postcode: 'Test Postcode',
    orgType: 'Test Organisation Type',
    companiesHouseNumber: 'Test Companies House Number',
    charityCommissionNumber: 'Test Charity Commission Number',
    fundingAmount: '1000',
    fundingLocation: ['Test Funding Location'],
  };

  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {},
    mandatoryQuestion,
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationSummaryPage
        {...getPageProps(getDefaultProps)}
      />
    );
    screen.getByRole('heading', {
      name: 'Confirm your details',
      level: 1,
    });
  });

  it('should display all the mandatory question details', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationSummaryPage
        {...getPageProps(getDefaultProps)}
      />
    );
    const mandatoryQuestionDetails = generateMandatoryQuestionDetails(
      mandatoryQuestion,
      'mandatoryQuestionId'
    );

    mandatoryQuestionDetails.forEach((detail) => {
      const labelElement = screen.getByText(detail.label);
      expect(labelElement).toBeInTheDocument();

      if (Array.isArray(detail.value)) {
        detail.value.forEach((v) => {
          const valueElement = screen.getByText(new RegExp(`${v}`));
          expect(valueElement).toBeInTheDocument();
        });
      } else {
        const valueElement = screen.getByText(
          detail.showCurrency ? `£ ${detail.value}` : detail.value
        );
        expect(valueElement).toBeInTheDocument();
      }
    });
    const changeLinks = screen.getAllByText('Change', {
      selector: 'a',
    });
    expect(changeLinks).toHaveLength(7);
  });

  it('should display a confirm and submit button', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationSummaryPage
        {...getPageProps(getDefaultProps)}
      />
    );

    const button = screen.getByRole('button', {
      name: 'Confirm and submit',
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      'href',
      `/api/mandatory-questions/mandatoryQuestionId/create-submission?schemeId=1`
    );
  });
});
