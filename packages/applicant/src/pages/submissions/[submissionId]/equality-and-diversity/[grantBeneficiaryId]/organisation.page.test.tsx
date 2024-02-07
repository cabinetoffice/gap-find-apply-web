import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect, PreviewData } from 'next';
import { parseBody } from '../../../../../utils/parseBody';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import React from 'react';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../../services/GrantBeneficiaryService';
import { createMockRouter } from '../../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import OrganisationPage, {
  getServerSideProps,
  OrganisationPageProps,
  OrganisationRadioOptions,
} from './organisation.page';
import { getContext } from '../../../../../testUtils/unitTestHelpers';
import { EqualityAndDiversityParams } from '../types';

jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/GrantBeneficiaryService');
jest.mock('../../../../../utils/jwt');

const mockParseBody = jest.mocked(parseBody);

const renderWithRouter = (ui: React.ReactNode) => {
  render(
    <RouterContext.Provider value={createMockRouter({})}>
      {ui}
    </RouterContext.Provider>
  );
};

describe('Organisation page', () => {
  const customProps = {
    formAction: '/testFormAction',
    defaultChecked: null,
  } as OrganisationPageProps;

  const component = <OrganisationPage {...customProps} />;

  describe('UI', () => {
    it('Renders expected UI', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Which of these options best describes your organisation?',
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

    const getServerContext = (
      overrides: GetServerSidePropsContext | object = {}
    ) =>
      getContext(
        () => ({
          params: {
            submissionId: 'testSubmissionId',
            grantBeneficiaryId: 'testGrantBeneficiaryId',
          },
          query: {
            returnToSummaryPage: null,
          },
          req: {
            method: 'GET',
          },
          res: {
            getHeader: () => 'testCSRFToken',
          },
          resolvedUrl: '/testResolvedURL',
        }),
        overrides
      ) as GetServerSidePropsContext<EqualityAndDiversityParams, PreviewData>;

    describe('when handling a GET request', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      it('Should return expected props', async () => {
        const response = (await getServerSideProps(
          getServerContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.formAction).toStrictEqual('/testResolvedURL');
        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/sex'
        );
        expect(response.props.defaultChecked).toStrictEqual(null);
      });

      it('Should return a skipURL prop to summary when returnToSummaryPage query is truthy', async () => {
        const response = (await getServerSideProps(
          getServerContext({ query: { returnToSummaryPage: 'anything' } })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.skipURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary'
        );
      });

      test.each([
        [
          1,
          {
            organisationGroup1: true,
            organisationGroup2: false,
            organisationGroup3: false,
          },
          OrganisationRadioOptions.VCSE,
        ],
        [
          2,
          {
            organisationGroup1: false,
            organisationGroup2: true,
            organisationGroup3: false,
          },
          OrganisationRadioOptions.SME,
        ],
        [
          3,
          {
            organisationGroup1: false,
            organisationGroup2: false,
            organisationGroup3: true,
          },
          OrganisationRadioOptions.NEITHER,
        ],
      ])(
        'Should return the previously entered response prop as the default value, CASE: "%s"',
        async (_, mockGrantBeneficiary, expectedOptions) => {
          (getGrantBeneficiary as jest.Mock).mockResolvedValue(
            mockGrantBeneficiary
          );
          const response = (await getServerSideProps(
            getServerContext()
          )) as NextGetServerSidePropsResponse;
          expect(response.props.defaultChecked).toStrictEqual(expectedOptions);
        }
      );

      it('Should NOT post a grant beneficiary response on page fetch', async () => {
        await getServerSideProps(getServerContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
      });

      it('Should redirect to the error service page if fetching the grant beneficiary fails', async () => {
        (getGrantBeneficiary as jest.Mock).mockRejectedValue({});

        const response = await getServerSideProps(getServerContext());

        expect(response).toStrictEqual(expectedServiceErrorRedirectObject);
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        mockParseBody.mockResolvedValue({
          organisation: OrganisationRadioOptions.VCSE,
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides = {}) =>
        getServerContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "organisation"', async () => {
        mockParseBody.mockResolvedValue({
          organisation: OrganisationRadioOptions.VCSE,
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            organisationGroup1: true,
            organisationGroup2: false,
            organisationGroup3: false,
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
