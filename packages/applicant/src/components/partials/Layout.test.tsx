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

describe('Layout Component', () => {
  test('should display', () => {
    render(
      <RouterContext.Provider value={createMockRouter({})}>
        <Layout>
          <>TEST</>
        </Layout>
      </RouterContext.Provider>
    );

    const footer = screen.getByRole('contentinfo');
    const main = screen.getByRole('main');
    expect(screen.getByText('TEST')).toBeDefined();
    expect(footer).toBeDefined();
    expect(main).toBeDefined();
  });

  test('should display back button if passed', () => {
    render(
      <RouterContext.Provider value={createMockRouter({})}>
        <Layout backBtnUrl="/test">
          <>TEST</>
        </Layout>
      </RouterContext.Provider>
    );
    const backButton = screen.getByRole('link', { name: 'Back' });
    expect(backButton.getAttribute('href')).toBe('/test');
  });
});
