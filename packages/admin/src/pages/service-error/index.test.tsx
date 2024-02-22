import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ServiceErrorPage from './index.page';
import ServiceError from './index.page';

const serviceErrorProps = {
  errorInformation: 'There has been a test service error',

  linkAttributes: {
    href: '/test/redirect',
    linkText: 'test redirect ',
    linkInformation: 'so we can test this page.',
  },
};

const serviceErrorPage = (
  <ServiceError serviceError={serviceErrorProps} excludeSubPath={false} />
);

describe('Service error page render', () => {
  it('Should render correct header', () => {
    render(serviceErrorPage);
    screen.getByRole('heading', {
      name: 'Sorry, there is a problem with the service',
    });
  });

  it('Should include try again message', () => {
    render(serviceErrorPage);
    screen.getByText('Try again later.');
  });

  it('Should include information about the error', () => {
    render(serviceErrorPage);
    screen.getByText('There has been a test service error');
  });

  it('Should include redirect link and information', () => {
    render(serviceErrorPage);
    const link = screen.getByRole('link', { name: 'test redirect' });
    expect(link).toHaveAttribute('href', '/apply/admin/test/redirect');
    screen.getByText('so we can test this page.');
  });

  it('Should not include redirect link if no link attributes are provided', () => {
    const { linkAttributes: _, ...errorInformation } = serviceErrorProps;
    render(<ServiceErrorPage serviceError={errorInformation} />);
    const link = screen.queryByRole('link');
    expect(link).toBeNull();
  });
});
