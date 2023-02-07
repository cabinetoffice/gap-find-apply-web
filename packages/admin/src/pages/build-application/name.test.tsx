import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ApplicationName, { getServerSideProps } from './name.page';
import { getValueFromSession } from '../../services/SessionService';
import { findApplicationFormFromScheme } from '../../services/SchemeService';
import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext } from 'next';
import NextGetServerSidePropsResponse from '../../types/NextGetServerSidePropsResponse';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../services/SessionService');
jest.mock('../../services/SchemeService');

const mockedFindApplicationFormFromScheme =
  findApplicationFormFromScheme as jest.MockedFn<
    typeof findApplicationFormFromScheme
  >;

const mockSchemeParams = {
  fieldErrors: [],
  backButtonHref: '/scheme/123',
  formAction: '/mock/action',
  csrfToken: 'testCsrfToken',
};

const component = <ApplicationName {...mockSchemeParams} />;

describe('Application name page', () => {
  it('Renders the question page layout output', () => {
    render(component);
    screen.getByTestId('form-test-id');
  });

  it('Should render a question hint text with a space in-between', () => {
    render(component);
    screen.getByText('Applicants will see this name on the application form.');
    screen.getByText(
      'Choose a name that is specific to your grant. For example, "Chargepoint scheme for landlords - phase 2"'
    );
  });

  it('Should render a default value when one is provided', () => {
    render(
      <ApplicationName
        {...mockSchemeParams}
        defaultValue="Application Name Default"
      />
    );
    expect(
      screen.getByDisplayValue('Application Name Default')
    ).toHaveAttribute('id', 'applicationName');
  });

  it('Default value should be blank when one isnt provided', () => {
    render(<ApplicationName {...mockSchemeParams} />);
    expect(screen.getByLabelText('Give this application a name')).toHaveValue(
      ''
    );
  });

  describe('getServerSideProps', () => {
    const expectedRedirectObject = {
      redirect: {
        destination:
          '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create a new application form.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
        permanent: false,
      },
    };

    const mockValidContext = {
      query: {
        grantSchemeId: '12345',
      } as ParsedUrlQuery,
      req: { method: 'GET', cookies: { 'gap-test': 'testSessionId' } as any },
    } as GetServerSidePropsContext;

    it('Returns correct default backButtonHref value', async () => {
      mockedFindApplicationFormFromScheme.mockResolvedValue([]);
      const value = (await getServerSideProps(
        mockValidContext
      )) as NextGetServerSidePropsResponse;

      expect(value.props.backButtonHref).toStrictEqual('/scheme/12345');
    });

    it('Should redirect to dashboard if no scheme id provided', async () => {
      const context = {
        query: {} as ParsedUrlQuery,
      } as GetServerSidePropsContext;

      const value = (await getServerSideProps(
        context
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    it('Should redirect to service error if scheme already has application form', async () => {
      mockedFindApplicationFormFromScheme.mockResolvedValue(['mock-app-id']);
      const value = (await getServerSideProps(
        mockValidContext
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });
  });
});
