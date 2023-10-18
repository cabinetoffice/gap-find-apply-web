import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationSummaryPage, {
  getServerSideProps,
} from './organisation-summary.page';
import { routes } from '../../../utils/routes';
import { ButtonTypePropertyEnum } from '../../../components/button/Button';

describe('Organisation summary page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {},
    mandatoryQuestion: {
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
    },
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

    const mandatoryQuestionDetails = [
      {
        id: 'organisationName',
        label: 'Name',
        value: 'Test Organisation',
        url: routes.mandatoryQuestions.namePage('mandatoryQuestionId'),
        status: 'Change',
      },
      {
        id: 'organisationAddress',
        label: 'Address',
        value: [
          'Test Address 1,',
          'Test Address 2,',
          'Test City,',
          'Test County,',
          'Test Postcode',
        ],
        url: routes.mandatoryQuestions.addressPage('mandatoryQuestionId'),
        status: 'Change',
      },
      {
        id: 'organisationType',
        label: 'Type of organisation',
        value: 'Test Organisation Type',
        url: routes.mandatoryQuestions.typePage('mandatoryQuestionId'),
        status: 'Change',
      },
      {
        id: 'organisationCompaniesHouseNumber',
        label: 'Companies house number',
        value: 'Test Companies House Number',
        url: routes.mandatoryQuestions.companiesHouseNumberPage(
          'mandatoryQuestionId'
        ),
        status: 'Change',
      },
      {
        id: 'organisationCharity',
        label: 'Charity commission number',
        value: 'Test Charity Commission Number',
        url: routes.mandatoryQuestions.charityCommissionNumberPage(
          'mandatoryQuestionId'
        ),
        status: 'Change',
      },
      {
        id: 'fundingAmount',
        label: 'Funding amount',
        value: '1000',
        url: routes.mandatoryQuestions.fundingAmountPage('mandatoryQuestionId'),
        status: 'Change',
      },
      {
        id: 'fundingLocation',
        label: 'Funding location',
        value: ['Test Funding Location'],
        url: routes.mandatoryQuestions.fundingLocationPage(
          'mandatoryQuestionId'
        ),
        status: 'Change',
      },
    ];

    mandatoryQuestionDetails.forEach((detail) => {
      const labelElement = screen.getByText(detail.label);
      expect(labelElement).toBeInTheDocument();

      if (Array.isArray(detail.value)) {
        detail.value.forEach((v) => {
          const valueElement = screen.getByText(v);
          expect(valueElement).toBeInTheDocument();
        });
      } else {
        const valueElement = screen.getByText(detail.value);
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
    expect(button).toHaveAttribute('type', ButtonTypePropertyEnum.Submit);
  });
});
