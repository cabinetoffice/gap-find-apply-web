import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../../testUtils/createMockRouter';
import { initiateCSRFCookie } from '../../utils/csrf';
import Login, { getServerSideProps } from './index.page';

jest.mock('../../utils/csrf');
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

const context = {
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;

const contextWithoutToken = {
  req: {},
  res: {},
} as GetServerSidePropsContext;

describe('getServerSideProps', () => {
  beforeEach(async () => {
    (initiateCSRFCookie as jest.Mock).mockImplementation(
      (): Promise<any> => Promise.resolve({ result: true })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should return the correct object from server side props', async () => {
    const response = await getServerSideProps(context);

    expect(response).toEqual({
      props: {
        csrfToken: 'testCSRFToken',
      },
    });

    expect(initiateCSRFCookie).toBeCalledTimes(1);
  });

  it('should return the correct object from server side props with no token', async () => {
    const response = await getServerSideProps(contextWithoutToken);

    expect(response).toEqual({
      props: {
        csrfToken: '',
      },
    });

    expect(initiateCSRFCookie).toBeCalledTimes(1);
  });
});

describe('Apply for a grant login page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/login`,
        })}
      >
        <Login csrfToken="testToken" />
      </RouterContext.Provider>
    );
  });
  it('should render back button', async () => {
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/'
    );
  });
  it('should render page heading', async () => {
    expect(
      screen.getByRole('heading', {
        name: /sign in to apply for a grant/i,
      })
    ).toBeDefined();
  });
  it('should render text input component', async () => {
    expect(
      screen.getByRole('textbox', {
        name: /enter your email address to receive a link/i,
      })
    ).toBeDefined();
  });
  it('should render sign in button', async () => {
    expect(
      screen.getByRole('button', {
        name: /sign in/i,
      })
    ).toBeDefined();
  });
});
