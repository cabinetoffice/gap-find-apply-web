import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationAddressPage, {
  getServerSideProps,
} from './organisation-address.page';
import { MQ_ORG_TYPES } from '../../../utils/constants';

describe('Organisation address page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    backButtonUrl: 'testBackButtonUrl',
    defaultFields: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      county: '',
      postcode: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
      orgType: MQ_ORG_TYPES.INDIVIDUAL,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading for individuals', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationAddressPage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter your address',
      level: 1,
    });
  });

  it('should display a heading for local authorities', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationAddressPage
        {...getPageProps(getDefaultProps, {
          mandatoryQuestion: {
            schemeId: 1,
            orgType: MQ_ORG_TYPES.LOCAL_AUTHORITY,
          },
        })}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter your local authority address',
      level: 1,
    });
  });

  it('should display a heading for organisations', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationAddressPage
        {...getPageProps(getDefaultProps, {
          mandatoryQuestion: {
            schemeId: 1,
            orgType: MQ_ORG_TYPES.LIMITED_COMPANY,
          },
        })}
      />
    );
    screen.getByRole('heading', {
      name: "Enter your organisation's address",
      level: 1,
    });
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationAddressPage
        {...getPageProps(getDefaultProps)}
      />
    );

    const textboxes = screen.getAllByRole('textbox');
    textboxes.forEach((textbox) => {
      expect(textbox).toHaveAttribute('value', '');
    });
  });

  it('should display inputs with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationAddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            addressLine1: 'Address Line 1',
            addressLine2: 'Address Line 2',
            city: 'City',
            county: 'County',
            postcode: 'Postcode',
          },
        })}
      />
    );
    const values = [
      'Address Line 1',
      'Address Line 2',
      'City',
      'County',
      'Postcode',
    ];
    const textboxes = screen.getAllByRole('textbox');
    textboxes.forEach((textbox, index) => {
      expect(textbox).toHaveAttribute('value', values[index]);
    });
  });
});
