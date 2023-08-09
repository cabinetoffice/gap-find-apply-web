import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import {
  getPageProps,
  renderWithRouter,
} from '../../testUtils/unitTestHelpers';
import OrganisationType, { getServerSideProps } from './type.page';

describe('Organisation type page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    organisationId: 'testOrganisationId',
    defaultFields: {
      type: '',
    },
  });

  it('should display a heading', () => {
    renderWithRouter(<OrganisationType {...getPageProps(getDefaultProps)} />);

    screen.getByRole('heading', {
      name: 'What is your organisation type? (optional)',
      level: 1,
    });
  });

  it('should display a question hint text', () => {
    renderWithRouter(<OrganisationType {...getPageProps(getDefaultProps)} />);

    screen.getByText('Why do we need this information?');
    screen.getByText(
      'It helps us to identify your organisation. We use this information for due diligence checks and to prevent fraud.'
    );
    screen.getByText('Choose one:');
  });

  it('should display radio buttons with no default', () => {
    renderWithRouter(<OrganisationType {...getPageProps(getDefaultProps)} />);

    screen.getByRole('radio', { name: 'Limited company', checked: false });
    screen.getByRole('radio', {
      name: 'Non-limited company',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Registered charity', checked: false });
    screen.getByRole('radio', {
      name: 'Unregistered charity',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Other', checked: false });
  });

  it('should display radio buttons with a default', () => {
    renderWithRouter(
      <OrganisationType
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            type: 'Registered charity',
          },
        })}
      />
    );

    screen.getByRole('radio', { name: 'Limited company', checked: false });
    screen.getByRole('radio', {
      name: 'Non-limited company',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Registered charity', checked: true });
    screen.getByRole('radio', {
      name: 'Unregistered charity',
      checked: false,
    });
    screen.getByRole('radio', { name: 'Other', checked: false });
  });
});
