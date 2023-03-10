import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../testUtils/createMockRouter';
import Home, { getServerSideProps } from './index.page';

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

describe('getServerSideProps', () => {
  it('should return loginUrl', async () => {
    const response = await getServerSideProps(null);
    expect(response).toEqual({
      props: {
        loginUrl: process.env.COLA_URL,
      },
    });
  });
});

describe('Apply for a grant home page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/`,
        })}
      >
        <Home loginUrl="https://test.url/some/path" />
      </RouterContext.Provider>
    );
  });

  it('should render page heading and description', async () => {
    expect(
      screen.getByText(/use this service to apply for a government grant\./i)
    ).toBeDefined();
    expect(
      screen.getByText(
        /If you have an account you can sign in. If you do not have an account you can register for one\./i
      )
    ).toBeDefined();
  });

  it('should render register button with correct href', async () => {
    expect(
      screen.getByRole('button', {
        name: /register/i,
      })
    ).toHaveAttribute('href', '/register');
  });

  it('should render link to login page with correct href', async () => {
    expect(
      screen.getByRole('link', {
        name: /i already have an account/i,
      })
    ).toHaveAttribute('href', 'https://test.url/some/path');
  });

  it('should find a grant section', async () => {
    expect(screen.getByTestId('find-a-grant-heading')).toBeDefined();
    expect(
      screen.getByText(
        /before you can apply, you will need to find a grant that you want to apply for\./i
      )
    ).toBeDefined();
    expect(screen.getByTestId('find-a-grant-link')).toHaveAttribute(
      'href',
      'https://www.find-government-grants.service.gov.uk/'
    );
  });
});
