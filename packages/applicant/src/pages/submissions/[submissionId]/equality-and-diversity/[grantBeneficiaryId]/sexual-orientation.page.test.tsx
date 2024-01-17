import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
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
import EqualityAndDiversityPage, {
  getServerSideProps,
  SexualOrientationPageProps,
} from './sexual-orientation.page';

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

describe('Sexual orientation page', () => {
  const customProps = {
    formAction: '/testFormAction',
    backButtonURL: '/back',
    defaultChecked: [],
    fieldErrors: [],
  } as SexualOrientationPageProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders a heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Does you organisation primarily focus on supporting a particular sexual orientation?',
      });
    });

    it('Should render a radio input', () => {
      renderWithRouter(component);
      screen.getByRole('checkbox', { name: 'Heterosexual or straight' });
      screen.getByRole('checkbox', { name: 'Gay or lesbian' });
      screen.getByRole('checkbox', { name: 'Bisexual' });
      screen.getByRole('checkbox', {
        name: 'Other',
      });
      screen.getByRole('checkbox', {
        name: 'No, we support people of any sexual orientation',
      });
    });

    it('Should render a conditional other sexual orientation details input', () => {
      renderWithRouter(component);
      screen.getByRole('textbox', {
        name: 'Let us know which sexual orientation',
      });
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
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/summary'
        );
      });

      it('Should return a backButtonURL prop', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.backButtonURL).toStrictEqual(
          '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/disability'
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

      it('Should return the previously entered response prop as the default value, CASE: "1"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexualOrientationGroup1: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          'Heterosexual or straight',
        ]);
      });

      it('Should return the previously entered response prop as the default value, CASE: "2 & 3"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexualOrientationGroup2: true,
          sexualOrientationGroup3: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          'Gay or lesbian',
          'Bisexual',
        ]);
      });

      it('Should return the previously entered value for the details input"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexualOrientationOther: true,
          sexualOrientationOtherDetails: 'testing',
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(['Other']);
        expect(response.props.defaultSexualOrientationDetails).toStrictEqual(
          'testing'
        );
      });

      it('Should return the previously entered response prop as the default value, CASE: "ALL"', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexualOrientationGroupAll: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          'No, we support people of any sexual orientation',
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
          supportedSexualOrientation: [
            'Heterosexual or straight',
            'Bisexual',
            'Other',
          ],
          sexualOrientationOtherDetails: 'test other details',
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({});
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should call postGrantBeneficiaryResponse when the response contains "supportedSexualOrientation", CASE: SOME', async () => {
        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
            sexualOrientationGroup1: true,
            sexualOrientationGroup2: false,
            sexualOrientationGroup3: true,
            sexualOrientationOther: true,
            sexualOrientationOtherDetails: 'test other details',
            sexualOrientationGroupAll: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "supportedSexualOrientation", CASE: ALL', async () => {
        mockParseBody.mockResolvedValue({
          supportedSexualOrientation: [
            'No, we support people of any sexual orientation',
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
            sexualOrientationGroup1: false,
            sexualOrientationGroup2: false,
            sexualOrientationGroup3: false,
            sexualOrientationOther: false,
            sexualOrientationOtherDetails: '',
            sexualOrientationGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response contains "supportedSexualOrientation", CASE: ALL', async () => {
        mockParseBody.mockResolvedValue({
          supportedSexualOrientation: [
            'Heterosexual or straight',
            'Gay or lesbian',
            'Bisexual',
            'Other',
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
            sexualOrientationGroup1: false,
            sexualOrientationGroup2: false,
            sexualOrientationGroup3: false,
            sexualOrientationOther: false,
            sexualOrientationOtherDetails: undefined,
            sexualOrientationGroupAll: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should NOT call postGrantBeneficiaryResponse when the response does NOT contain "supportedSexualOrientation"', async () => {
        mockParseBody.mockResolvedValue({});

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
      });

      it('Should redirect to the summary page', async () => {
        const response = await getServerSideProps(getPostContext());

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
          sexualOrientationGroup2: true,
          sexualOrientationOther: 'test should not render',
        });

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [
                {
                  fieldName: 'supportedSexualOrientation',
                  errorMessage: 'Error',
                },
              ],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual([
          'Heterosexual or straight',
          'Bisexual',
          'Other',
        ]);
      });

      it('Should return the previously entered response prop as the default value when a validation error is thrown', async () => {
        mockParseBody.mockResolvedValue({
          supportedSexualOrientation: 'Bisexual',
        });

        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          sexualOrientationGroup2: true,
          sexualOrientationOther: 'test should not render',
        });

        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue({
          response: {
            data: {
              errors: [
                {
                  fieldName: 'supportedSexualOrientation',
                  errorMessage: 'Error',
                },
              ],
            },
          },
        });

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(['Bisexual']);
      });
    });
  });
});
