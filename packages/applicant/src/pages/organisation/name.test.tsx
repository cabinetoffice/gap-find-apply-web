import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import {
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import OrganisationName, { getServerSideProps } from './name.page';
import { MQ_ORG_TYPES } from '../../utils/constants';

describe('Organisation name page', () => {
  const getDefaultProps = (
    organisationType?: string
  ): InferProps<typeof getServerSideProps> => ({
    organisationType,
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    organisationId: 'testOrganisationId',
    defaultFields: {
      legalName: '',
    },
  });

  it('should display a heading', () => {
    renderWithRouter(<OrganisationName {...getPageProps(getDefaultProps)} />);

    screen.getByRole('heading', {
      name: 'Enter the name of your organisation (Optional)',
      level: 1,
    });
  });

  it('should display a heading and hint text for an individual', () => {
    renderWithRouter(
      <OrganisationName
        {...getPageProps(() => getDefaultProps(MQ_ORG_TYPES.INDIVIDUAL))}
      />
    );

    screen.getByText('Your name will appear on your application.');
    screen.getByRole('heading', {
      name: 'Enter your full name (Optional)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(<OrganisationName {...getPageProps(getDefaultProps)} />);

    screen.getByText(
      'Enter the official name of your organisation. It could be the name that is registered with Companies House or the Charity Commission.'
    );
  });

  it('should display text input with no default', () => {
    renderWithRouter(<OrganisationName {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('value', '');
  });

  it('should display radio buttons with a default', () => {
    renderWithRouter(
      <OrganisationName
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            legalName: 'AND Digital',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('value', 'AND Digital');
  });
});
