import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import React from 'react';
import { createMockRouter } from '../../testUtils/createMockRouter';
import ServiceErrorPage, { getServerSideProps } from './index.page';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});

const serviceErrorProps = {
  errorInformation: 'There has been a test service error',
  linkAttributes: {
    href: '/test/redirect',
    linkText: 'test redirect ',
    linkInformation: 'so we can test this page.',
  },
};

const context = {
  query: {
    serviceErrorProps: JSON.stringify(serviceErrorProps),
  },
} as unknown as GetServerSidePropsContext;

const serviceErrorPage = <ServiceErrorPage serviceError={serviceErrorProps} />;

const renderWithRouter = (ui: React.ReactNode) => {
  render(
    <RouterContext.Provider value={createMockRouter({})}>
      {ui}
    </RouterContext.Provider>
  );
};

describe('Get server side props', () => {
  it('should return the correct props from server side props', async () => {
    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: { serviceError: serviceErrorProps },
    });
  });
});

describe('Service error page render', () => {
  it('Should render correct header', () => {
    renderWithRouter(serviceErrorPage);
    screen.getByRole('heading', {
      name: 'Sorry, there is a problem with the service',
    });
  });

  it('Should include try again message', () => {
    renderWithRouter(serviceErrorPage);
    screen.getByText('Try again later.');
  });

  it('Should include information about the error', () => {
    renderWithRouter(serviceErrorPage);
    screen.getByText('There has been a test service error');
  });

  it('Should include redirect link and information', () => {
    renderWithRouter(serviceErrorPage);
    const link = screen.getByRole('link', { name: 'test redirect' });
    expect(link).toHaveAttribute('href', '/test/redirect');
    screen.getByText('so we can test this page.');
  });

  it('Should not include redirect link if no link attributes are provided', () => {
    const { linkAttributes: _, ...errorInformation } = serviceErrorProps;
    renderWithRouter(<ServiceErrorPage serviceError={errorInformation} />);
    const link = screen.queryByRole('link', { name: 'test redirect ' });
    expect(link).toBeNull();
  });
});
