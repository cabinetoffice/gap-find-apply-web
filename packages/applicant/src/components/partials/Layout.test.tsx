import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';
import Layout from './Layout';

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

jest.mock('./navigation', () => ({
  NavigationBar: () => <p>NavigationBar</p>,
}));

jest.mock('./Header');

const LayoutWithRouter = ({ isUserLoggedIn }: { isUserLoggedIn?: boolean }) => (
  <RouterContext.Provider value={createMockRouter({})}>
    <Layout backBtnUrl="/test" isUserLoggedIn={isUserLoggedIn}>
      <>TEST</>
    </Layout>
  </RouterContext.Provider>
);

describe('Layout Component', () => {
  test('should render the navigation bar', () => {
    render(<LayoutWithRouter isUserLoggedIn={true} />);
    expect(screen.getByText('NavigationBar')).toBeDefined();
  });

  test('should display', () => {
    render(<LayoutWithRouter />);
    const footer = screen.getByRole('contentinfo');
    const main = screen.getByRole('main');
    expect(screen.getByText('TEST')).toBeDefined();
    expect(footer).toBeDefined();
    expect(main).toBeDefined();
  });

  test('should display back button if passed', () => {
    render(<LayoutWithRouter />);
    const backButton = screen.getByRole('link', { name: 'Back' });
    expect(backButton.getAttribute('href')).toBe('/test');
  });
});
