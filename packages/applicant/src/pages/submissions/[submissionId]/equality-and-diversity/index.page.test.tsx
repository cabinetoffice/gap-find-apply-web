import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ValidationError } from 'gap-web-ui';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import React from 'react';
import {
  getGrantBeneficiary,
  postGrantBeneficiaryResponse,
} from '../../../../services/GrantBeneficiaryService';
import { parseBody } from '../../../../utils/parseBody';
import { createMockRouter } from '../../../../testUtils/createMockRouter';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import { getJwtFromCookies } from '../../../../utils/jwt';
import EqualityAndDiversityPage, {
  getServerSideProps,
  SubmissionConfirmationProps,
} from './index.page';

jest.mock('../../../../utils/parseBody');
jest.mock('../../../../services/GrantBeneficiaryService');
jest.mock('../../../../utils/jwt');

const mockParseBody = jest.mocked(parseBody);

const renderWithRouter = (ui: React.ReactNode) => {
  render(
    <RouterContext.Provider value={createMockRouter({})}>
      {ui}
    </RouterContext.Provider>
  );
};

describe('Equality and diversity start page', () => {
  const customProps = {
    formAction: '/testFormAction',
    defaultChecked: 'Yes, answer the equality questions (takes 2 minutes)',
    fieldErrors: [],
  } as SubmissionConfirmationProps;

  const component = <EqualityAndDiversityPage {...customProps} />;

  describe('UI', () => {
    it('Renders a heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'We have received your application',
      });
    });

    it('Renders a question heading', () => {
      renderWithRouter(component);
      screen.getByRole('heading', {
        name: 'Do you want to answer the equality questions?',
      });
    });

    it('Should render a radio input', () => {
      renderWithRouter(component);
      screen.getByRole('radio', {
        name: 'Yes, answer the equality questions (takes 2 minutes)',
      });
      screen.getByRole('radio', { name: 'No, skip the equality questions' });
    });

    it('Should default to "Yes"', () => {
      renderWithRouter(component);
      expect(
        screen.getByRole('radio', {
          name: 'Yes, answer the equality questions (takes 2 minutes)',
        })
      ).toHaveAttribute('checked');
    });

    it('Should render a continue button', () => {
      renderWithRouter(component);
      screen.getByRole('button', { name: 'Continue' });
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
          } as Record<string, string>,
          query: {
            grantBeneficiaryId: '',
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
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      });

      it('Should return a formAction prop', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          hasProvidedAdditionalAnswers: true,
        });

        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.formAction).toStrictEqual('/testResolvedURL');
      });

      it('Should NOT post a grant beneficiary response', async () => {
        await getServerSideProps(getContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).not.toHaveBeenCalled();
      });

      it('Should fetch the grantBeneficiary when the grantBeneficiaryId exists', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          hasProvidedAdditionalAnswers: true,
        });

        await getServerSideProps(
          getContext({
            query: { grantBeneficiaryId: 'testGrantBeneficiaryId' },
          })
        );

        expect(getGrantBeneficiary as jest.Mock).toHaveBeenNthCalledWith(
          1,
          'testSubmissionId',
          'testJwt'
        );
      });

      it('Should return the previously entered hasProvidedAdditionalAnswers when the grantBeneficiaryId exists, case: FALSE', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          hasProvidedAdditionalAnswers: false,
        });

        const response = (await getServerSideProps(
          getContext({
            query: { grantBeneficiaryId: 'testGrantBeneficiaryId' },
          })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'No, skip the equality questions'
        );
      });

      it('Should return the previously entered hasProvidedAdditionalAnswers when the grantBeneficiaryId exists, case: TRUE', async () => {
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          hasProvidedAdditionalAnswers: true,
        });

        const response = (await getServerSideProps(
          getContext({
            query: { grantBeneficiaryId: 'testGrantBeneficiaryId' },
          })
        )) as NextGetServerSidePropsResponse;

        expect(response.props.defaultChecked).toStrictEqual(
          'Yes, answer the equality questions (takes 2 minutes)'
        );
      });

      it('Should redirect to the error service page if fetching the grant beneficiary fails', async () => {
        (getGrantBeneficiary as jest.Mock).mockRejectedValue({});

        const response = await getServerSideProps(
          getContext({
            query: { grantBeneficiaryId: 'testGrantBeneficiaryId' },
          })
        );

        expect(response).toStrictEqual(expectedServiceErrorRedirectObject);
      });
    });

    describe('when handling a POST request', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        mockParseBody.mockResolvedValue({
          hasProvidedAdditionalAnswers: 'Yes',
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockResolvedValue(
          'testGrantBeneficiaryId'
        );
        (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
        (getGrantBeneficiary as jest.Mock).mockResolvedValue({
          grantBeneficiaryId: 'testGrantBeneficiaryId',
          hasProvidedAdditionalAnswers: true,
        });
      });

      const getPostContext = (overrides: any = {}) =>
        getContext(merge({ req: { method: 'POST' } }, overrides));

      it('Should return correct props', async () => {
        const validationErrors = [
          {
            fieldName: 'sectionTitle',
            errorMessage: 'Please enter a section name',
          },
        ] as ValidationError[];
        const rejectedValue = {
          response: { data: { errors: validationErrors } },
        };
        mockParseBody.mockResolvedValue({
          hasProvidedAdditionalAnswers: null,
        });
        (postGrantBeneficiaryResponse as jest.Mock).mockRejectedValue(
          rejectedValue
        );
        const response = await getServerSideProps(getPostContext());

        expect(response).toEqual({
          props: {
            formAction: '/testResolvedURL',
            defaultChecked:
              'Yes, answer the equality questions (takes 2 minutes)',
            csrfToken: 'testCSRFToken',
            fieldErrors: validationErrors,
          },
        });
      });

      it('Should call postGrantBeneficiaryResponse when the response is "Yes"', async () => {
        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse when the response is "No"', async () => {
        mockParseBody.mockResolvedValue({
          hasProvidedAdditionalAnswers: 'No',
        });

        await getServerSideProps(getPostContext());

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: false,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should call postGrantBeneficiaryResponse with the grantBeneficiaryId query param when it exists', async () => {
        await getServerSideProps(
          getPostContext({
            query: { grantBeneficiaryId: 'testGrantBeneficiaryId' },
          })
        );

        expect(
          postGrantBeneficiaryResponse as jest.Mock
        ).toHaveBeenNthCalledWith(
          1,
          {
            submissionId: 'testSubmissionId',
            hasProvidedAdditionalAnswers: true,
          },
          'testJwt',
          'testGrantBeneficiaryId'
        );
      });

      it('Should redirect to the next question when the response is "Yes"', async () => {
        const response = await getServerSideProps(getPostContext());

        expect(response).toStrictEqual({
          redirect: {
            statusCode: 302,
            destination:
              '/submissions/testSubmissionId/equality-and-diversity/testGrantBeneficiaryId/organisation',
          },
        });
      });

      it('Should redirect to the submission confirmation page when the response is "No"', async () => {
        mockParseBody.mockResolvedValue({
          hasProvidedAdditionalAnswers: 'No',
        });

        const response = await getServerSideProps(getPostContext());

        expect(response).toStrictEqual({
          redirect: {
            statusCode: 302,
            destination:
              '/submissions/testSubmissionId/submission-confirmation',
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
