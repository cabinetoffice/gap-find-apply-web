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
      },
    });
  });
});

const loginUrl = getLoginUrl();

describe('Apply for a grant home page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/`,
        })}
      >
        <Home loginUrl={loginUrl} />
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
        /You use GOV.UK One Login to sign into Find a grant. If you do not have a One Login account already, you will need to create one./i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /If you have used Find a grant before, you will still be able to see all of your information when you register or sign in using One Login using the same email address./i
      )
    ).toBeDefined();
  });

  it('should render Sign in with One Login button with correct href', async () => {
    expect(
      screen.getByRole('button', {
        name: /Sign in with One Login/i,
      })
    ).toHaveAttribute('href', loginUrl);
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
      'https://www.find-government-grants.service.gov.uk/grants'
    );
  });
});
