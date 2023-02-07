import { screen } from '@testing-library/react';
import InferProps from '../../types/InferProps';
import { getPageProps, renderWithRouter } from '../../utils/UnitTestHelpers';
import AddressPage, { getServerSideProps } from './address.page';

describe('Organisation address page', () => {
  const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
    fieldErrors: [],
    csrfToken: 'testCSRFToken',
    formAction: 'testFormAction',
    organisationId: 'testOrganisationId',
    defaultFields: {
      addressLine1: '',
      addressLine2: '',
      town: '',
      county: '',
      postcode: '',
    },
  });

  it('should display a heading', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    screen.getByRole('heading', {
      name: 'Enter the address of your organisation (optional)',
      level: 1,
    });
  });

  it('should display an address line 1 text input with no default', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    expect(
      screen.getByRole('textbox', { name: 'Address line 1' })
    ).toHaveAttribute('value', '');
  });

  it('should display an address line 1 text input with a default', () => {
    renderWithRouter(
      <AddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            addressLine1: 'test address line 1',
          },
        })}
      />
    );

    expect(
      screen.getByRole('textbox', { name: 'Address line 1' })
    ).toHaveAttribute('value', 'test address line 1');
  });

  it('should display an address line 2 text input with no default', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    expect(
      screen.getByRole('textbox', { name: 'Address line 2' })
    ).toHaveAttribute('value', '');
  });

  it('should display an address line 2 text input with a default', () => {
    renderWithRouter(
      <AddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            addressLine2: 'test address line 2',
          },
        })}
      />
    );

    expect(
      screen.getByRole('textbox', { name: 'Address line 2' })
    ).toHaveAttribute('value', 'test address line 2');
  });

  it('should display a town text input with no default', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    expect(
      screen.getByRole('textbox', { name: 'Town or City' })
    ).toHaveAttribute('value', '');
  });

  it('should display a town text input with a default', () => {
    renderWithRouter(
      <AddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            town: 'test town',
          },
        })}
      />
    );

    expect(
      screen.getByRole('textbox', { name: 'Town or City' })
    ).toHaveAttribute('value', 'test town');
  });

  it('should display a county text input with no default', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('textbox', { name: 'County' })).toHaveAttribute(
      'value',
      ''
    );
  });

  it('should display a county text input with a default', () => {
    renderWithRouter(
      <AddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            county: 'test county',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox', { name: 'County' })).toHaveAttribute(
      'value',
      'test county'
    );
  });

  it('should display a postcode text input with no default', () => {
    renderWithRouter(<AddressPage {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('textbox', { name: 'Postcode' })).toHaveAttribute(
      'value',
      ''
    );
  });

  it('should display a postcode text input with a default', () => {
    renderWithRouter(
      <AddressPage
        {...getPageProps(getDefaultProps, {
          defaultFields: {
            postcode: 'test postcode',
          },
        })}
      />
    );

    expect(screen.getByRole('textbox', { name: 'Postcode' })).toHaveAttribute(
      'value',
      'test postcode'
    );
  });
});
