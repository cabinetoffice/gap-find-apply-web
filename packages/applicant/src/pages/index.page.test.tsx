import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMockRouter } from '../testUtils/createMockRouter';
import Home, { getServerSideProps } from './index.page';
import { getLoginUrl } from '../utils/general';

describe('getServerSideProps', () => {
  it('should return page props', async () => {
    const response = await getServerSideProps(null);
    expect(response).toEqual({
      props: {
        loginUrl: getLoginUrl(),
        registerUrl: `${process.env.USER_SERVICE_URL}/register`,
      },
    });
  });
});

const registerUrl = 'https://test.url/register';

describe('Apply for a grant home page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/`,
        })}
      >
        <Home loginUrl="https://test.url/some/path" registerUrl={registerUrl} />
      </RouterContext.Provider>
    );
  });

  it('should render page heading and description', async () => {
    expect(
      screen.getByText(/Use this service to apply for a government grant./i)
    ).toBeDefined();
    expect(
      screen.getByText(
        /During your application you will be asked questions that help funding organisations make a decision about who to award funding to./i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /If you have an account you can sign in. If you do not have an account you can register for one./i
      )
    ).toBeDefined();
  });

  it('should render register button with correct href', async () => {
    expect(
      screen.getByRole('button', {
        name: /register/i,
      })
    ).toHaveAttribute('href', registerUrl);
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
      'https://www.find-government-grants.service.gov.uk'
    );
  });
});
