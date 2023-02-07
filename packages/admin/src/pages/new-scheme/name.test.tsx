import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SchemeName, { getServerSideProps } from './name.page';
import {
  addToSession,
  getValueFromSession,
} from '../../services/SessionService';
import NextGetServerSidePropsResponse from '../../types/NextGetServerSidePropsResponse';
import { merge } from 'lodash';
import { parseBody } from 'next/dist/server/api-utils/node';

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
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../services/SessionService');

const mockedGetValueFromSession = getValueFromSession as jest.MockedFn<
  typeof getValueFromSession
>;

const mockSchemeParams = {
  fieldErrors: [],
  backButtonHref: '',
  formAction: '',
  defaultValue: '',
};

const component = <SchemeName {...mockSchemeParams} />;

describe('Scheme name page', () => {
  it('Renders the question page layout output', () => {
    render(component);
    screen.getByTestId('form-test-id');
  });

  describe('getServerSideProps', () => {
    const getContext = (overrides: any = {}) =>
      merge(
        {
          req: { cookies: { session_id: 'someId' } },
          method: 'GET',
          query: {},
        },
        overrides
      );

    describe('when handling a GET request', () => {
      it('Returns correct backButtonHref value when a property for it is passed in', async () => {
        const value = (await getServerSideProps(
          getContext({
            query: { backButtonHref: '/new-scheme/summary' },
          })
        )) as NextGetServerSidePropsResponse;

        expect(value.props.backButtonHref).toStrictEqual('/new-scheme/summary');
      });

      it('Returns a default backButtonHref value when a property for it is NOT passed in', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.backButtonHref).toStrictEqual('/dashboard');
      });

      it('Returns a blank defaultValue when there is a value in the session', async () => {
        mockedGetValueFromSession.mockResolvedValueOnce('some default value');

        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.defaultValue).toStrictEqual('some default value');
      });

      it('Returns a blank defaultValue when there is NOT a value in the session', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.defaultValue).toStrictEqual(undefined);
      });

      it('Returns a default formAction', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.formAction).toStrictEqual(
          '/apply/new-scheme/name?backButtonHref=/dashboard&successRedirect=/new-scheme/ggis-reference'
        );
      });

      it('Returns a correct formAction value when back & success redirects are passed in', async () => {
        const value = (await getServerSideProps(
          getContext({
            query: {
              backButtonHref: '/testBack',
              successRedirect: '/testRedirect',
            },
          })
        )) as NextGetServerSidePropsResponse;

        expect(value.props.formAction).toStrictEqual(
          '/apply/new-scheme/name?backButtonHref=/testBack&successRedirect=/testRedirect'
        );
      });

      it('Returns an empty list of field errors', async () => {
        const value = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(value.props.fieldErrors).toStrictEqual([]);
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          name: 'testName',
        });
        (addToSession as jest.Mock).mockResolvedValue({
          session_id: 'SESSION',
        });
      });

      const getPostContext = (overrides: any = {}) =>
        merge(getContext({ req: { method: 'POST' } }), overrides);

      it('Should redirect to the success redirect when adding to the session succeeds', async () => {
        const value = await getServerSideProps(getPostContext());

        expect(value).toStrictEqual({
          redirect: {
            destination: '/new-scheme/ggis-reference',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the service error page when adding to the session fails (and it is not a validation error)', async () => {
        (addToSession as jest.Mock).mockRejectedValueOnce({});

        const value = await getServerSideProps(getPostContext());

        expect(value).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create the grant scheme.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      describe('Validation errors', () => {
        const fieldErrors = [
          { fieldName: 'name', errorMessage: 'Name is required' },
        ];

        beforeEach(() => {
          (addToSession as jest.Mock).mockRejectedValue({
            response: {
              data: {
                fieldErrors: fieldErrors,
              },
            },
          });
        });

        it('Should return validation errors', async () => {
          const value = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(value.props.fieldErrors).toStrictEqual(fieldErrors);
        });

        it('Should return the previously inputted name when adding to the session throws validation errors', async () => {
          const value = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(value.props.defaultValue).toStrictEqual('testName');
        });
      });
    });
  });
});
