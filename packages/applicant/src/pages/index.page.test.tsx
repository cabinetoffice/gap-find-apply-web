import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../testUtils/createMockRouter';
import Home, { getServerSideProps } from './index.page';
import { getLoginUrl } from '../utils/general';
import { merge } from 'lodash';

describe('getServerSideProps', () => {
  it('should return page props', async () => {
    const response = await getServerSideProps(null);
    expect(response).toEqual({
      props: {
        loginUrl: getLoginUrl(),
        oneLoginEnabled: process.env.ONE_LOGIN_ENABLED,
        registerUrl: `${process.env.USER_SERVICE_URL}/register`,
      },
    });
  });
  it('should overwrite loginUrl when redirecturl is provided', async () => {
    const redirectUrl = 'http://localhost:3001/mandtory-questions/start';
    process.env.LOGIN_URL = 'http://baseLoginUrl?redirectUrl=' + redirectUrl;
    process.env.V2_LOGIN_URL = 'http://baseLoginUrl?redirectUrl=' + redirectUrl;

    const props = {
      req: {
        query: {
          redirectUrl: redirectUrl,
        },
      },
    };
    const response = await getServerSideProps(merge(props));
    expect(response).toEqual({
      props: {
        loginUrl: `http://baseLoginUrl?redirectUrl=${redirectUrl}`,
        oneLoginEnabled: process.env.ONE_LOGIN_ENABLED,
        registerUrl: `${process.env.USER_SERVICE_URL}/register`,
      },
    });
  });
  it('should not override loginUrl when redirecturl is undefined', async () => {
    process.env.LOGIN_URL = 'http://baseLoginUrl';
    process.env.V2_LOGIN_URL = 'http://baseLoginUrl';

    const props = {
      req: {
        query: {
          redirectUrl: undefined,
        },
      },
    };

    const response = await getServerSideProps(merge(props));
    expect(response).toEqual({
      props: {
        loginUrl: `http://baseLoginUrl`,
        oneLoginEnabled: process.env.ONE_LOGIN_ENABLED,
        registerUrl: `${process.env.USER_SERVICE_URL}/register`,
      },
    });
  });
});

process.env.LOGIN_URL =
  'http://localhost:8082/login?redirectUrl=http://localhost:3000/apply/applicant/isAdmin';

const loginUrl = getLoginUrl();
const oneLoginEnabled = 'true';
const registerUrl = 'a-register-url';

describe('Apply for a grant home page', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/`,
        })}
      >
        <Home
          loginUrl={loginUrl}
          oneLoginEnabled={oneLoginEnabled}
          registerUrl={registerUrl}
        />
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
        /You use GOV.UK One Login to sign into Find a grant. If you do not have a GOV.UK One Login already, you will need to create one./i
      )
    ).toBeDefined();
    expect(
      screen.getByText(
        /If you have used Find a grant before, you can see all of your information if you register for GOV.UK One Login using the same email address./i
      )
    ).toBeDefined();
  });

  it('should render Sign in with One Login button with correct href', async () => {
    expect(
      screen.getByRole('button', {
        name: /Sign in with GOV.UK One Login/i,
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
