import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { routes } from '../../utils/routes';
import RegisterConfirmationPage, {
  getServerSideProps,
} from './confirmation.page';

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
  it('should add the login URL to the returned props', async () => {
    process.env.COLA_URL = 'https://test.url/some/path';
    const result = await getServerSideProps();

    expect(result).toEqual({
      props: {
        loginUrl: 'https://test.url/some/path',
      },
    });
  });
});

describe('The register confirmation page ', () => {
  it('should render the register components correctly', () => {
    const loginUrl = 'https://login.com';
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: routes.register.confirmation,
        })}
      >
        <RegisterConfirmationPage loginUrl={loginUrl} />
      </RouterContext.Provider>
    );

    expect(screen.getByText('Registration complete')).toBeDefined();
    expect(screen.getByText('What happens next')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveProperty(
      'href',
      `${loginUrl}/`
    );
    const allFindAGrantLinks = screen.getAllByRole('link', {
      name: 'Find a grant',
    });
    expect(allFindAGrantLinks[0]).toHaveProperty(
      'href',
      'http://localhost' + routes.grants
    );
  });
});
