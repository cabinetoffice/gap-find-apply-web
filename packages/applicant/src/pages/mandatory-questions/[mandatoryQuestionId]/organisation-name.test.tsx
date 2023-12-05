import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationNamePage, {
  getServerSideProps,
} from './organisation-name.page';
import { MQ_ORG_TYPES } from '../../../utils/constants';

describe('Organisation name page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    backButtonUrl: 'testBackButtonUrl',
    defaultFields: {
      name: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
    mandatoryQuestionId: 'mandatoryQuestionId',
  });

  it('should display a heading', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps)}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter the name of your organisation',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps)}
      />
    );
  });

  it('should display a different heading if user is individual', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps, {
          mandatoryQuestion: {
            schemeId: 1,
            orgType: MQ_ORG_TYPES.INDIVIDUAL,
          },
        })}
      />
    );

    screen.getByRole('heading', {
      name: 'Enter your full name',
      level: 1,
    });
  });

  it('should display a different question hint text if user is individual', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps, {
          mandatoryQuestion: {
            schemeId: 1,
            orgType: MQ_ORG_TYPES.INDIVIDUAL,
          },
        })}
      />
    );

    screen.getByText('Your name will appear on your application.');
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps)}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display text input with a default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            name: 'AND Digital',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', 'AND Digital');
  });
});
