import { screen } from '@testing-library/react';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';
import InferProps from '../../../types/InferProps';
import MandatoryQuestionOrganisationNamePage, {
  getServerSideProps,
} from './organisation-name.page';

describe('Organisation name page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    defaultFields: {
      name: '',
    },
    mandatoryQuestion: {
      schemeId: 1,
    },
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

    screen.getByText(
      'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charity Commission'
    );
  });

  it('should display text input with no default', () => {
    renderWithRouter(
      <MandatoryQuestionOrganisationNamePage
        {...getPageProps(getDefaultProps)}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display radio buttons with a default', () => {
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
