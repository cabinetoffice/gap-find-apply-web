import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import SummaryListProps from '../../components/summary-list/SummaryListType';
import SchemeSummary, { getServerSideProps } from './summary.page';
import { getSummaryFromSession } from '../../services/SessionService';
import NextGetServerSidePropsResponse from '../../types/NextGetServerSidePropsResponse';
import { merge } from 'lodash';
import { parseBody } from '../../utils/parseBody';
import { createNewScheme } from '../../services/SchemeService';

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
jest.mock('../../utils/parseBody');
jest.mock('../../services/SessionService');
jest.mock('../../services/SchemeService');

const mockedGetSummaryFromSession = getSummaryFromSession as jest.MockedFn<
  typeof getSummaryFromSession
>;

const mockSummaryList: SummaryListProps = {
  rows: [],
};
const component = <SchemeSummary summaryData={mockSummaryList} />;

describe('Scheme summary page', () => {
  describe('SchemeSummary', () => {
    beforeEach(() => {
      render(component);
    });

    it('Renders a back button', () => {
      const backButtonElement = screen.getByRole('link', { name: 'Back' });
      expect(backButtonElement).toHaveAttribute(
        'href',
        '/apply/new-scheme/email'
      );
    });

    it('Renders a confirm details button', () => {
      screen.getByRole('button', { name: 'Confirm' });
    });

    it('Renders a form with an appropriate action', () => {
      const formElement = screen.getByTestId('form-test-id');
      expect(formElement).toHaveAttribute(
        'action',
        '/apply/new-scheme/summary'
      );
    });

    it('Renders the Summary List component', () => {
      screen.getByTestId('summary-list');
    });
  });

  describe('getServerSideProps', () => {
    const getContext = (overrides: any = {}) =>
      merge(
        {
          req: { method: 'GET', cookies: { session_id: 'sessionId' } },
          res: { getHeader: jest.fn() },
          query: {},
        },
        overrides
      );

    beforeEach(() => {
      mockedGetSummaryFromSession.mockResolvedValue({
        name: 'mockName',
        ggisReference: 'mockGGiSReference',
      });
      process.env.SESSION_COOKIE_NAME = 'session_id';
    });

    it('Should redirect to the service error page when the sessionId does not exist', async () => {
      const result = await getServerSideProps(
        getContext({ req: { cookies: { session_id: '' } } })
      );

      expect(result).toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create the grant scheme.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    describe('when handling a GET request', () => {
      it('Should create a summary list of the new scheme with a "Change link" for each field', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.summaryData.rows[0].action).toStrictEqual({
          href: '/new-scheme/name?backButtonHref=%2Fnew-scheme%2Fsummary&successRedirect=%2Fnew-scheme%2Fsummary',
          label: 'Change',
          ariaLabel: 'Change scheme name',
        });
        expect(result.props.summaryData.rows[1].action).toStrictEqual({
          href: '/new-scheme/ggis-reference?backButtonHref=%2Fnew-scheme%2Fsummary&successRedirect=%2Fnew-scheme%2Fsummary',
          label: 'Change',
          ariaLabel: 'Change scheme GGIS reference',
        });
        expect(result.props.summaryData.rows[2].action).toStrictEqual({
          href: '/new-scheme/email?backButtonHref=%2Fnew-scheme%2Fsummary&successRedirect=%2Fnew-scheme%2Fsummary',
          label: 'Change',
          ariaLabel: 'Change scheme contact email address',
        });
      });

      it('Should create a summary list of the new scheme with an appropriate row key for each field', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.summaryData.rows[0].key).toStrictEqual(
          'Grant name'
        );
        expect(result.props.summaryData.rows[1].key).toStrictEqual(
          'GGIS Scheme Reference Number'
        );
      });

      it('Should create a summary list of the new scheme with the right field value for each field', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.summaryData.rows[0].value).toStrictEqual(
          'mockName'
        );
        expect(result.props.summaryData.rows[1].value).toStrictEqual(
          'mockGGiSReference'
        );
      });
    });

    describe('when handling a POST request', () => {
      const getPostContext = (overrides: any = {}) =>
        merge(getContext({ req: { method: 'POST' } }), overrides);

      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({});
        (createNewScheme as jest.Mock).mockResolvedValue({});
      });

      it('Should redirect to the dashboard when creating the scheme succeeds', async () => {
        const result = await getServerSideProps(getPostContext());

        expect(result).toStrictEqual({
          redirect: {
            destination: '/dashboard',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the service page when an error is thrown (and it is NOT a validation error', async () => {
        (createNewScheme as jest.Mock).mockRejectedValue({});

        const result = await getServerSideProps(getPostContext());

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create the grant scheme.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the service page when an error is thrown (and it is a validation error', async () => {
        (createNewScheme as jest.Mock).mockRejectedValue({
          response: {
            data: {
              fieldErrors: [],
            },
          },
        });

        const result = await getServerSideProps(getPostContext());

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create the grant scheme.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });
  });
});
