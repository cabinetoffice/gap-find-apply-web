import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import { parseBody } from 'next/dist/server/api-utils/node';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import React from 'react';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../../services/GrantBeneficiaryService';
import { createMockRouter } from '../../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import EqualityAndDiversityPage, {
  getServerSideProps,
  SexPageProps,
} from './sex.page';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../../services/GrantBeneficiaryService');
jest.mock('../../../../../utils/jwt');

const renderWithRouter = (ui: React.ReactNode) => {
  render(
    <RouterContext.Provider value={createMockRouter({})}>
      {ui}
    </RouterContext.Provider>
  );
};

describe('Sex page', () => {
  const customProps = {
    formAction: '/testFormAction',
    defaultChecked: null,
  } as SexPageProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders a heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Does your organisation primarily focus on supporting a particular sex?',
      });
    });

    it('Should render a radio input', () => {
      renderWithRouter(component);
      screen.getByRole('radio', {
        name: 'Male',
      });
      screen.getByRole('radio', { name: 'Female' });
      screen.getByRole('radio', { name: 'No, we support both sexes' });
    });

    it('Should render a continue button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Continue' });
    });

    it('Should render a skip this question button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Skip this question' });
    });
  });

  describe('GetServerSideProps', () => {
    const expectedServiceErrorRedirectObject = {
      redirect: {
        destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to upload your equality and diversity responses","linkAttributes":{"href":"/submissions/testSubmissionId/equality-and-diversity","linkText":"Please return","linkInformation":" and try again."}}`,
        statusCode: 302,
      } as Redirect,
    };

    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            submissionId: 'testSubmissionId',
            grantBeneficiaryId: 'testGrantBeneficiaryId',
          } as Record<string, string>,
          query: {
            returnToSummaryPage: null,
          } as Record<string, string>,
          req: {
            method: 'GET',
          },
          resolvedUrl: '/testResolvedURL',
        } as GetServerSidePropsContext,
        overrides
      );

    describe('when handling a GET request', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      it('Should return a formAction prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.formAction).toStrictEqual('/testResolvedURL');
      });

      it('Should return a skipURL prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/age'
        );
      });

      it('Should return a skipURL prop to summary when returnToSummaryPage query is truthy', async () => {
        const response = (await getServerSideProps(
          getContext({ query: { returnToSummaryPage: 'anything' } })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary'
        );
      });

      it('Should return a defaultChecked prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(null);
      });

      it('Should return the previously entered response prop as the default value, CASE: "all"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexGroupAll: true,
          sexGroup1: true,
          sexGroup2: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'No, we support both sexes'
        );
      });

      it('Should return the previously entered response prop as the default value, CASE: "1"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexGroup1: true,
          sexGroup2: false,
          sexGroupAll: false,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual('Male');
      });

      it('Should return the previously entered response prop as the default value, CASE: "2"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexGroup2: true,
          sexGroup1: false,
          sexGroupAll: false,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual('Female');
      });

      it('Should NOT post a grant beneficiary response', async () => {
        await getServerSideProps(getContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
      });

      it('Should fetch the grantBeneficiary', async () => {
        await getServerSideProps(getContext());

        expect(getGrantBeneficiary as jest.Mock).toHaveBeenNthCalledWith(
          1,
          'testSubmissionId',
          'testJwt'
        );
      });

      it('Should redirect to the error service page if fetching the grant beneficiary fails', async () => {
        (getGrantBeneficiary as jest.Mock).mockRejectedValue({});

        const response = await getServerSideProps(getContext());

        expect(response).toStrictEqual(expectedServiceErrorRedirectObject);
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        (parseBody as jest.Mock).mockResolvedValue({
          sex: 'Female',
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "sex", CASE: 1', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          sex: 'Male',
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            sexGroup1: true,
            sexGroup2: false,
            sexGroupAll: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "sex", CASE: 2', async () => {
        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            sexGroup1: false,
            sexGroup2: true,
            sexGroupAll: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "sex", CASE: ALL', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          sex: 'NoWeSupportBothSexes',
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            sexGroup1: true,
            sexGroup2: true,
            sexGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should redirect to the next question when the returnToSummaryPage does NOT exist', async () => {
        const response = await getServerSideProps(getPostContext());

        expect(response).toStrictEqual({
          redirect: {
            statusCode: 302,
            destination:
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/age',
          },
        });
      });

      it('Should redirect to the summary page when the returnToSummaryPage exists', async () => {
        const response = await getServerSideProps(
          getPostContext({ query: { returnToSummaryPage: 'anything' } })
        );

        expect(response).toStrictEqual({
          redirect: {
            statusCode: 302,
            destination:
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary',
          },
        });
      });

      it('Should redirect to the error service page if posting the grant beneficiary response fails', async () => {
        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({});

        const response = await getServerSideProps(getPostContext());

        expect(response).toStrictEqual(expectedServiceErrorRedirectObject);
      });
    });
  });
});
