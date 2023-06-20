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
  OrganisationPageProps,
  OrganisationRadioOptions
} from './organisation.page';

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
  } as OrganisationPageProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders expected UI', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Which type of organisation are you applying for a grant on behalf of?',
      });
      screen.getByRole('radio', {
        name: OrganisationRadioOptions.VCSE,
      });
      screen.getByRole('radio', { name: OrganisationRadioOptions.SME });
      screen.getByRole('radio', { name: OrganisationRadioOptions.NEITHER });
      screen.getByRole('button', { name: 'Continue' });
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

      it('Should return expected props', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.formAction).toStrictEqual('/testResolvedURL');
        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/sex'
        );
        expect(response.props.defaultChecked).toStrictEqual(null);
      });

      it('Should return a skipURL prop to summary when returnToSummaryPage query is truthy', async () => {
        const response = (await getServerSideProps(
          getContext({ query: { returnToSummaryPage: 'anything' } })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary'
        );
      });

      it('Should return the previously entered response prop as the default value, CASE: "1"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          organisationGroup1: true,
          organisationGroup2: false,
          organisationGroup3: false
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(OrganisationRadioOptions.VCSE);
      });

      it('Should return the previously entered response prop as the default value, CASE: "2"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          organisationGroup1: false,
          organisationGroup2: true,
          organisationGroup3: false
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(OrganisationRadioOptions.SME);
      });

      it('Should return the previously entered response prop as the default value, CASE: "3"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          organisationGroup1: false,
          organisationGroup2: false,
          organisationGroup3: true
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          OrganisationRadioOptions.NEITHER
        );
      });

      it('Should NOT post a grant beneficiary response on page fetch', async () => {
        await getServerSideProps(getContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
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
          organisation: OrganisationRadioOptions.VCSE,
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "organisation"', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          organisation: OrganisationRadioOptions.VCSE,
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            organisationGroup1: true,
            organisationGroup2: false,
            organisationGroup3: false
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
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/sex',
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
