import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationTypePage, {
  getServerSideProps,
} from './organisation-type.page';

describe('Organisation Type page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      orgType: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
    backButtonUrl: '/test/path',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationTypePage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Choose your application type',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationTypePage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByText(
      'Choose the option that best describes you or your organisation'
    );
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationTypePage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('radio', { name: 'Limited company', checked: false });
    screen.getByRole('radio', {
      name: 'Non-limited company',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Charity', checked: false });
    screen.getByRole('radio', {
      name: 'I am applying as an individual',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Other', checked: false });
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationTypePage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            orgType: 'Charity',
          },
        })}
      />
    );

    screen.getByRole('radio', { name: 'Limited company', checked: false });
    screen.getByRole('radio', {
      name: 'Non-limited company',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Charity', checked: true });
    screen.getByRole('radio', {
      name: 'I am applying as an individual',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Other', checked: false });
  });
});
