import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SchemeGGiSReference, { getServerSideProps } from './ggis-reference.page';
import { getGrantScheme } from '../../../services/SchemeService';
import { ParsedUrlQuery } from 'querystring';
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  Redirect,
} from 'next';

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
jest.mock('../../../services/SchemeService');
const mockedgetScheme = getGrantScheme as jest.MockedFn<typeof getGrantScheme>;

const mockSchemeParams = {
  fieldErrors: [],
  backButtonHref: '',
  formAction: '',
  defaultValue: '',
};

const mockGetSchemeReturn = {
  schemeId: 'a028d000004OsD1AAK',
  funderId: 'a068d000004kAlmAAE',
  name: 'Rimas Test Scheme',
  ggisReference: 'GGiS reference',
  version: '16.0',
  createdDate: '2022-07-15T09:04:01.000+00:00',
  contactEmail: 'rimas.kalvelis@and.digital',
};

const getServersidePropsReturn = {
  fieldErrors: [],
  backButtonHref: '/scheme/someId',
  formAction: process.env.SUB_PATH + '/testFormAction',
  defaultValue: null,
  csrfToken: 'testCSRFToken',
};

const component = <SchemeGGiSReference {...mockSchemeParams} />;

describe('Scheme ggis reference page', () => {
  it('Renders the question page layout output', () => {
    render(component);
    screen.getByTestId('question-page-form');
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getServerSideProps', () => {
    it('Redirects to an error page if no valid schemeId is provided', async () => {
      const context = {
        query: {} as ParsedUrlQuery,
        req: { method: 'GET' },
        res: { getHeader: jest.fn() },
      } as unknown as GetServerSidePropsContext;

      const value = (await getServerSideProps(
        context
      )) as GetServerSidePropsResult<Redirect>;

      expect(value).toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the scheme.","linkAttributes":{"href":"/dashboard","linkText":"Please try again.","linkInformation":"Your previous progress has been lost."}}',
          permanent: false,
        },
      });
    });

    describe('With schemeId provided', () => {
      it('Returns correct prop values when there are no values passed in', async () => {
        const context = {
          query: { schemeId: 'someId' } as ParsedUrlQuery,
          req: { method: 'GET' },
          res: { getHeader: () => 'testCSRFToken' },
          resolvedUrl: '/testFormAction',
        } as unknown as GetServerSidePropsContext;

        mockedgetScheme.mockResolvedValue(mockGetSchemeReturn);
        const value = (await getServerSideProps(context)) as {
          props: { [key: string]: any };
        };

        expect(value).toStrictEqual({
          props: getServersidePropsReturn,
        });
      });
    });
  });
});
