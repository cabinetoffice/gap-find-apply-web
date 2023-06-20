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
  EthnicityPageProps,
  getServerSideProps,
} from './ethnicity.page';

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

describe('Ethnicity page', () => {
  const customProps = {
    formAction: '/testFormAction',
    backButtonURL: '/back',
    defaultChecked: null,
    fieldErrors: [],
  } as EthnicityPageProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders a heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Does your organisation primarily focus on supporting a particular ethnic group?',
      });
    });

    it('Should render a radio input', () => {
      renderWithRouter(component);
      screen.getByRole('radio', { name: 'White' });
      screen.getByRole('radio', { name: 'Mixed or multiple ethnic groups' });
      screen.getByRole('radio', { name: 'Asian or Asian British' });
      screen.getByRole('radio', {
        name: 'Black, African, Caribbean or Black British',
      });
      screen.getByRole('radio', { name: 'Arab' });
      screen.getByRole('radio', { name: 'Other ethnic group' });
      screen.getByRole('radio', {
        name: 'No, we support all ethnic groups',
      });
    });

    it('Should render a conditional other ethnicity details input', () => {
      renderWithRouter(component);
      screen.getByRole('textbox', { name: 'Type the ethnic group here' });
    });

    it('Should render a continue button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Continue' });
    });

    it('Should render a skip this question button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Skip this question' });
    });

    it('Should render a back button', () => {
      renderWithRouter(component);
      screen.getByRole('link', { name: 'Back' });
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
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/disability'
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

      it('Should return a backButtonURL prop to summary when returnToSummaryPage query is truthy', async () => {
        const response = (await getServerSideProps(
          getContext({ query: { returnToSummaryPage: 'anything' } })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.backButtonURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary'
        );
      });

      it('Should return a backButtonURL prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.backButtonURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/age'
        );
      });

      it('Should return a defaultChecked prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(null);
      });

      it('Should return the previously entered response prop as the default value, CASE: "1"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroup1: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual('White');
      });

      it('Should return the previously entered response prop as the default value, CASE: "2"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroup2: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'Mixed or multiple ethnic groups',
        );
      });

      it('Should return the previously entered value for the details input"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroupOther: true,
          ethnicOtherDetails: 'testing',
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'Other ethnic group'
        );
        expect(response.props.defaultEthnicityDetails).toStrictEqual('testing');
      });

      it('Should return the previously entered response prop as the default value, CASE: "ALL"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroupAll: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'No, we support all ethnic groups',
        );
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
          supportedEthnicity: 'White',
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "supportedEthnicity", CASE: 1', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          supportedEthnicity: 'White',
        }),
        
        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            ethnicGroup1: true,
            ethnicGroup2: false,
            ethnicGroup3: false,
            ethnicGroup4: false,
            ethnicGroup5: false,
            ethnicGroupOther: false,
            ethnicOtherDetails: '',
            ethnicGroupAll: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "supportedEthnicity", CASE: ALL', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          supportedEthnicity: 'NoWeSupportAllEthnicGroups',
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            ethnicGroup1: true,
            ethnicGroup2: true,
            ethnicGroup3: true,
            ethnicGroup4: true,
            ethnicGroup5: true,
            ethnicGroupOther: false,
            ethnicOtherDetails: '',
            ethnicGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should NOT call postGrantBeneficiaryResponse when the response does NOT contain "supportedEthnicity"', async () => {
        (parseBody as jest.Mock).mockResolvedValue({});

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
      });

      it('Should redirect to the next question when the returnToSummaryPage does NOT exist', async () => {
        const response = await getServerSideProps(getPostContext());

        expect(response).toStrictEqual({
          redirect: {
            statusCode: 302,
            destination:
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/disability',
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

      it('Should return the previously entered response prop as the default value when a validation error is thrown', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroup2: true,
          ethnicGroupOther: 'test should not render',
        });

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [
                { fieldName: 'supportedEthnicity', errorMessage: 'Error' },
              ],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'Mixed or multiple ethnic groups',
        );
      });

      it('Should return the previously entered response prop as the default value when a validation error is thrown', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          supportedEthnicity: 'White',
        });

        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ethnicGroup2: true,
          ethnicGroupOther: 'test should not render',
        });

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [
                { fieldName: 'supportedEthnicity', errorMessage: 'Error' },
              ],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual('White');
      });
    });
  });
});
