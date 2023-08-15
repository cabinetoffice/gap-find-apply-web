import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import {
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import OrganisationName, { getServerSideProps } from './name.page';

describe('Organisation name page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
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
      name: 'Enter the name of your organisation (optional)',
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
