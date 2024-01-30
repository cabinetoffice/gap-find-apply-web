import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { parseBody } from '../../../../../utils/parseBody';
import React from 'react';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../../services/GrantBeneficiaryService';
import { createMockRouter } from '../../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { getJwtFromCookies } from '../../../../../utils/jwt';
import EqualityAndDiversityPage, {
  AgePageProps,
  getServerSideProps,
} from './age.page';

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

describe('Age page', () => {
  const customProps = {
    formAction: '/testFormAction',
    defaultChecked: [],
    fieldErrors: [],
    backButtonURL: '/back',
  } as AgePageProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders a heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Does your organisation primarily focus on supporting a particular age group?',
      });
    });

    it('Should render a radio input', () => {
      renderWithRouter(component);
      screen.getByRole('checkbox', { name: '0 to 14 year olds' });
      screen.getByRole('checkbox', { name: '15 to 24 year olds' });
      screen.getByRole('checkbox', { name: '25 to 54 year olds' });
      screen.getByRole('checkbox', { name: '55 to 64 year olds' });
      screen.getByRole('checkbox', { name: '65 year olds and over' });
      screen.getByRole('checkbox', { name: 'No, we support all age groups' });
    });

    it('Should render a continue button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Continue' });
    });

    it('Should render a skip this question button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Skip this question' });
    });

    it('Should render a back button to the sex page', () => {
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
          res: {
            getHeader: () => 'testCSRFToken',
          },
          resolvedUrl: '/testResolvedURL',
        } as unknown as GetServerSidePropsContext,
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
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/ethnicity'
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

      it('Should return a backButtonURL prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.backButtonURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/sex'
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

      it('Should return a defaultChecked prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([]);
      });

      it('Should return the previously entered response prop as the default value, CASE: "1 & 5"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ageGroup1: true,
          ageGroup5: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          '0 to 14 year olds',
          '65 year olds and over',
        ]);
      });

      it('Should return the previously entered response prop as the default value, CASE: "2, 3 & 4"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ageGroup2: true,
          ageGroup3: true,
          ageGroup4: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          '15 to 24 year olds',
          '25 to 54 year olds',
          '55 to 64 year olds',
        ]);
      });

      it('Should return the previously entered response prop as the default value, CASE: "ALL"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          ageGroupAll: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          'No, we support all age groups',
        ]);
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
        mockParseBody.mockResolvedValue({
          supportedAges: ['25 to 54 year olds', '55 to 64 year olds'],
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "ageGroup", CASE: SOME', async () => {
        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            ageGroup1: false,
            ageGroup2: false,
            ageGroup3: true,
            ageGroup4: true,
            ageGroup5: false,
            ageGroupAll: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "ageGroup", CASE: ALL', async () => {
        mockParseBody.mockResolvedValue({
          supportedAges: ['No, we support all age groups'],
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            ageGroup1: false,
            ageGroup2: false,
            ageGroup3: false,
            ageGroup4: false,
            ageGroup5: false,
            ageGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "ageGroup", CASE: ALL', async () => {
        mockParseBody.mockResolvedValue({
          supportedAges: [
            '0 to 14 year olds',
            '15 to 24 year olds',
            '25 to 54 year olds',
            '55 to 64 year olds',
            '65 year olds and over',
          ],
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            ageGroup1: false,
            ageGroup2: false,
            ageGroup3: false,
            ageGroup4: false,
            ageGroup5: false,
            ageGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response does NOT contain "ageGroup"', async () => {
        mockParseBody.mockResolvedValue({});

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: false,
            ageGroup1: false,
            ageGroup2: false,
            ageGroup3: false,
            ageGroup4: false,
            ageGroup5: false,
            ageGroupAll: false,
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
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/ethnicity',
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
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [{ fieldName: 'supportedAges', errorMessage: 'Error' }],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          '25 to 54 year olds',
          '55 to 64 year olds',
        ]);
      });

      it('Should return the previously entered response prop as the default value when a validation error is thrown', async () => {
        mockParseBody.mockResolvedValue({
          supportedAges: '25 to 54 year olds',
        });

        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [{ fieldName: 'supportedAges', errorMessage: 'Error' }],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          '25 to 54 year olds',
        ]);
      });
    });
  });
});
