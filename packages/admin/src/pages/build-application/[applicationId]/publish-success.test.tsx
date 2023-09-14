import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import { merge } from 'lodash';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { getGrantScheme } from '../../../services/SchemeService';
import PublishSuccessPage, { getServerSideProps } from './publish-success.page';

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
jest.mock('../../../services/ApplicationService');
jest.mock('../../../services/SchemeService');

describe('Publish success page', () => {
  const getProps = (overrides: any = {}) =>
    merge(
      {
        grantName: 'Test grant name',
        grantSchemeId: 'testGrantSchemeId',
        applicationId: 'testApplicationId',
      },
      overrides
    );

  beforeEach(() => {
    render(<PublishSuccessPage {...getProps()} />);
  });

  it('Should render a meta title', () => {
    expect(document.title).toBe(
      'Publish your application form - Manage a grant'
    );
  });

  it('Should render a confirmation panel', () => {
    screen.getByText('Grant application form published');
  });

  it('Should render a url to apply for the newly published application', () => {
    screen.getByRole('link', {
      name: 'http://localhost:8080/applications/testApplicationId',
    });
  });

  it('Should render a "Manage this grant" button', () => {
    expect(
      screen.getByRole('button', { name: 'Manage this grant' })
    ).toHaveAttribute('href', '/apply/scheme/testGrantSchemeId');
  });

  it('Should render an "Add a new grant" link', () => {
    expect(
      screen.getByRole('link', { name: 'Add a new grant' })
    ).toHaveAttribute('href', '/apply/new-scheme/name');
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
    (getApplicationFormSummary as jest.Mock).mockResolvedValue({});
    (getGrantScheme as jest.Mock).mockResolvedValue({
      name: 'Test grant name',
      schemeId: 'testSchemeId',
    });
  });

  it('Should return a grant scheme id', async () => {
    const response = (await getServerSideProps(
      getContext()
    )) as NextGetServerSidePropsResponse;

    expect(response.props.grantSchemeId).toStrictEqual('testSchemeId');
  });

  it('Should redirect to the service error page when we fail to fetch the application form summary', async () => {
    (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

    const response = await getServerSideProps(getContext());

    expect(response).toStrictEqual({
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to publish the application.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
        statusCode: 302,
      },
    });
  });

  it('Should redirect to the service error page when we fail to fetch the grant scheme', async () => {
    (getGrantScheme as jest.Mock).mockRejectedValue({});

    const response = await getServerSideProps(getContext());

    expect(response).toStrictEqual({
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to publish the application.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
        statusCode: 302,
      },
    });
  });
});
