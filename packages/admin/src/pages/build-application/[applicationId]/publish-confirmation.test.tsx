import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { merge } from 'lodash';
import PublishConfirmationPage, {
  getServerSideProps,
} from './publish-confirmation.page';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import { updateApplicationFormStatus } from '../../../services/ApplicationService';
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
jest.mock('../../../services/ApplicationService');

describe('Publish confirmation page', () => {
  const getProps = (overrides: any = {}) =>
    merge(
      {
        backHref: '/testBack',
        formAction: '/testFormAction',
        fieldErrors: [],
      },
      overrides
    );

  it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
    render(<PublishConfirmationPage {...getProps()} />);
    expect(document.title).toBe('Publish your application form - Manage a grant');
  });

  it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
    render(
      <PublishConfirmationPage
        {...getProps({
          fieldErrors: [
            { fieldName: 'confirmation', errorMessage: 'Required' },
          ],
        })}
      />
    );

    expect(document.title).toBe('Error: Publish your application form - Manage a grant');
  });

  it('Should render a back button', () => {
    render(<PublishConfirmationPage {...getProps()} />);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/apply/testBack'
    );
  });

  it('Should render a yes/no radio input', () => {
    render(<PublishConfirmationPage {...getProps()} />);
    screen.getByRole('radio', { name: 'Yes' });
    screen.getByRole('radio', { name: 'No' });
  });

  it('Should render a confirm button', () => {
    render(<PublishConfirmationPage {...getProps()} />);
    screen.getByRole('button', { name: 'Confirm' });
  });

  it('Should render a cancel button', () => {
    render(<PublishConfirmationPage {...getProps()} />);
    screen.getByRole('link', { name: 'Cancel' });
  });
});

describe('getServerSideProps', () => {
  const getContext = (overrides: any = {}) =>
    merge(
      {
        params: { applicationId: 'testApplicationId' } as Record<
          string,
          string
        >,
        req: {
          method: 'GET',
          cookies: { 'gap-test': 'testSessionId' },
        } as any,
        resolvedUrl: '/resolvedURL',
      } as GetServerSidePropsContext,
      overrides
    );

  beforeEach(() => {
    process.env.SESSION_COOKIE_NAME = 'gap-test';
  });

  describe('when handling a GET request', () => {
    it('Should return a back href', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.backHref).toStrictEqual(
        '/build-application/testApplicationId/dashboard'
      );
    });

    it('Should return a form action', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.formAction).toStrictEqual('/resolvedURL');
    });

    it('Should return a list of field errors', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.fieldErrors).toStrictEqual([]);
    });
  });

  describe('when handling a POST request', () => {
    const getPostContext = (overrides: any = {}) =>
      merge(getContext({ req: { method: 'POST' } }), overrides);

    beforeEach(() => {
      (updateApplicationFormStatus as jest.Mock).mockResolvedValue({});
      (parseBody as jest.Mock).mockResolvedValue({
        confirmation: 'true',
      });
    });

    it('Should update the application form status when the user selects "Yes"', async () => {
      await getServerSideProps(getPostContext());

      expect(updateApplicationFormStatus as jest.Mock).toHaveBeenNthCalledWith(
        1,
        'testApplicationId',
        'PUBLISHED',
        'testSessionId'
      );
    });

    it('Should NOT update the application form status when the user selects "No"', async () => {
      (parseBody as jest.Mock).mockResolvedValue({ confirmation: 'false' });

      await getServerSideProps(getPostContext());

      expect(updateApplicationFormStatus as jest.Mock).not.toHaveBeenCalled();
    });

    it('Should redirect to the success page when the user selects "Yes"', async () => {
      const response = await getServerSideProps(getPostContext());

      expect(response).toStrictEqual({
        redirect: {
          destination: '/build-application/testApplicationId/publish-success',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the dashboard page when the user selects "No"', async () => {
      (parseBody as jest.Mock).mockResolvedValue({ confirmation: 'false' });

      const response = await getServerSideProps(getPostContext());

      expect(response).toStrictEqual({
        redirect: {
          destination: '/build-application/testApplicationId/dashboard',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page when updating the application form status fails', async () => {
      (updateApplicationFormStatus as jest.Mock).mockRejectedValue({});

      const response = await getServerSideProps(getPostContext());

      expect(response).toStrictEqual({
        redirect: {
          statusCode: 302,
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to publish the application.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
        },
      });
    });
  });
});
