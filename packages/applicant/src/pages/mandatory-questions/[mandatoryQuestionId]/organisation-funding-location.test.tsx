import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationFundingLocationPage, {
  getServerSideProps,
} from './organisation-funding-location.page';

describe('Funding Location page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      fundingLocation: [''],
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingLocationPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Where will this funding be spent?',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingLocationPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByText(
      'Select the location where the grant funding will be spent. You can choose more than one, if it is being spent in more than one location. Select all that apply:'
    );
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingLocationPage
        {...getPageProps(getDefaultProps)}
      />
    );
    const values = [
      'North East (England)',
      'North West (England)',
      'Yorkshire and the Humber',
      'East Midlands (England)',
      'West Midlands (England)',
      'East (England)',
      'London',
      'South East (England)',
      'South West (England)',
      'Scotland',
      'Wales',
      'Northern Ireland',
      'Outside of the UK',
    ];
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox, index) => {
      expect(checkbox).toHaveAttribute('value', values[index]);
    });
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationFundingLocationPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            fundingLocation: ['London', 'Scotland', 'Northern Ireland'],
          },
        })}
      />
    );

    const keys = [
      'North East (England)',
      'North West (England)',
      'Yorkshire and the Humber',
      'East Midlands (England)',
      'West Midlands (England)',
      'East (England)',
      'London',
      'South East (England)',
      'South West (England)',
      'Scotland',
      'Wales',
      'Northern Ireland',
      'Outside of the UK',
    ];
    const values = {
      'North East (England)': false,
      'North West (England)': false,
      'Yorkshire and the Humber': false,
      'East Midlands (England)': false,
      'West Midlands (England)': false,
      'East (England)': false,
      London: true,
      'South East (England)': false,
      'South West (England)': false,
      Scotland: true,
      Wales: false,
      'Northern Ireland': true,
      'Outside of the UK': false,
    };
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox, index) => {
      expect(checkbox).toHaveAttribute('value', keys[index]);
      if (values[keys[index]]) {
        expect(checkbox).toBeChecked();
      } else {
        expect(checkbox).not.toBeChecked();
      }
    });
  });
});
