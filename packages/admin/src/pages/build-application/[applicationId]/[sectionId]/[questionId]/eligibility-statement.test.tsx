import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { getGrantScheme } from '../../../../../services/SchemeService';
import { axios } from '../../../../../utils/axios';
import { updateSectionStatus } from '../../../../../services/SectionService';
import { parseBody } from '../../../../../utils/parseBody';
import EligibilityStatement, {
  getServerSideProps,
} from './eligibility-statement.page';

jest.mock('../../../../../utils/axios');
jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/SectionService');
jest.mock('../../../../../services/SchemeService');

const getMockSchemeParams = (overrides: any = {}) =>
  merge(
    {
      fieldErrors: [],
      backButtonHref: '',
      formAction: '',
      questionCaption: '',
      defaultValue: '',
      csrfToken: '',
      applicationStatus: 'DRAFT' as const,
      pageCaption: '',
    },
    overrides
  );

const getCallParams = (overrides = {}) =>
  merge(
    {
      resolvedUrl: '/resolvedUrl',
      params: {
        applicationId: 'testAppId',
        sectionId: 'testSectionId',
        questionId: 'testQuestionId',
      },
      req: {
        method: 'POST',
        cookies: { 'gap-test': 'testSessionId' },
      },
      res: { getHeader: () => 'testCSRFToken' },
    },
    overrides
  ) as unknown as GetServerSidePropsContext;

const getGetResponse = (overrides = {}) =>
  merge(
    {
      data: {
        applicationName: 'Test App Name',
        applicationStatus: 'DRAFT',
        sections: [
          {
            sectionId: 'testSectionId',
            questions: [
              {
                questionId: 'testQuestionId',
                displayText: 'default value',
              },
            ],
          },
        ],
        audit: {
          version: 1,
        },
      },
    },
    overrides
  );

describe('Eligibility question page page', () => {
  describe('getServerSideProps', () => {
    describe('when handling a POST request', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          displayText: 'test display text',
        });
        (updateSectionStatus as jest.Mock).mockResolvedValue({});
        process.env.SESSION_COOKIE_NAME = 'gap-test';
      });

      it('redirects to the application dashboard when the update is complete', async () => {
        (axios.patch as jest.Mock).mockResolvedValue({});

        const result = await getServerSideProps(getCallParams());

        expect(result).toEqual({
          redirect: {
            destination: '/build-application/testAppId/dashboard',
            statusCode: 302,
          },
        });
      });

      it('redirects to the error page if the update fails', async () => {
        (axios.patch as jest.Mock).mockRejectedValue(new Error('test error'));

        const result = await getServerSideProps(getCallParams());

        expect(result).toEqual({
          redirect: {
            destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/build-application/testAppId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
            statusCode: 302,
          },
        });
      });

      it('returns props for the page to render if there are field errors', async () => {
        const err = new Error('test error');
        (err as any).response = {
          data: { fieldErrors: ['testFieldError'] },
        };
        (axios.patch as jest.Mock).mockRejectedValue(err);
        (axios.get as jest.Mock).mockResolvedValue(getGetResponse());

        const result = await getServerSideProps(getCallParams());

        expect(result).toEqual({
          props: {
            backButtonHref: '/build-application/testAppId/dashboard',
            defaultValue: 'test display text',
            fieldErrors: ['testFieldError'],
            formAction: process.env.SUB_PATH + '/resolvedUrl',
            pageCaption: 'Test App Name',
            csrfToken: 'testCSRFToken',
            applicationStatus: 'DRAFT',
            version: 1,
          },
        });
      });

      it('Should update the section status when patching a question succeeds', async () => {
        await getServerSideProps(getCallParams());

        expect(updateSectionStatus as jest.Mock).toHaveBeenCalledTimes(1);
        expect(updateSectionStatus as jest.Mock).toHaveBeenCalledWith(
          'testSessionId',
          'testAppId',
          'testSectionId',
          'COMPLETE'
        );
      });

      it('Should NOT update the section status when patching a question fails', async () => {
        (axios.patch as jest.Mock).mockRejectedValue({});

        await getServerSideProps(getCallParams());

        expect(updateSectionStatus as jest.Mock).not.toHaveBeenCalled();
      });

      it('returns blank string as default value if there are field errors and a blank value was submitted', async () => {
        (parseBody as jest.Mock).mockResolvedValue({
          displayText: '',
        });
        const err = new Error('test error');
        (err as any).response = {
          data: { fieldErrors: ['testFieldError'] },
        };
        (axios.patch as jest.Mock).mockRejectedValue(err);
        (axios.get as jest.Mock).mockResolvedValue(getGetResponse());

        const result = await getServerSideProps(getCallParams());

        expect(result).toEqual({
          props: {
            backButtonHref: '/build-application/testAppId/dashboard',
            defaultValue: '',
            fieldErrors: ['testFieldError'],
            formAction: process.env.SUB_PATH + '/resolvedUrl',
            pageCaption: 'Test App Name',
            csrfToken: 'testCSRFToken',
            applicationStatus: 'DRAFT',
            version: 1,
          },
        });
      });
    });

    describe('When handling a GET request', () => {
      it('returns props for rendering', async () => {
        (axios.get as jest.Mock).mockResolvedValue(
          getGetResponse({
            data: {
              sections: [
                {
                  questions: [
                    {
                      displayText: 'test display text',
                    },
                  ],
                },
              ],
              audit: {
                version: 1,
              },
            },
          })
        );

        const result = await getServerSideProps(
          getCallParams({ req: { method: 'GET' } as any })
        );

        expect(result).toEqual({
          props: {
            backButtonHref: '/build-application/testAppId/dashboard',
            defaultValue: 'test display text',
            fieldErrors: [],
            formAction: process.env.SUB_PATH + '/resolvedUrl',
            pageCaption: 'Test App Name',
            csrfToken: 'testCSRFToken',
            applicationStatus: 'DRAFT',
            version: 1,
          },
        });
      });

      it('returns props for rendering a preview', async () => {
        (axios.get as jest.Mock).mockResolvedValueOnce(
          getGetResponse({
            data: {
              sections: [
                {
                  questions: [
                    {
                      displayText: 'test display text',
                    },
                  ],
                },
              ],
              applicationStatus: 'PUBLISHED',
            },
          })
        );

        (getGrantScheme as jest.Mock).mockResolvedValueOnce({
          name: 'testGrantName',
        });

        const result = await getServerSideProps(
          getCallParams({ req: { method: 'GET' } as any })
        );

        expect(result).toEqual({
          props: {
            fieldErrors: [],
            formAction: process.env.SUB_PATH + '/resolvedUrl',
            csrfToken: 'testCSRFToken',
            backButtonHref: '/build-application/testAppId/dashboard',
            defaultValue: 'test display text',
            grantName: 'testGrantName',
            applicationStatus: 'PUBLISHED',
          },
        });
      });

      it('does not attempt to update the question', async () => {
        (axios.get as jest.Mock).mockResolvedValue(getGetResponse());

        await getServerSideProps(
          getCallParams({ req: { method: 'GET' } as any })
        );

        expect(axios.patch).not.toHaveBeenCalled();
      });
    });

    it('redirects to error page if provided question ID does not exist', async () => {
      (axios.get as jest.Mock).mockResolvedValue(getGetResponse());

      const result = await getServerSideProps(
        getCallParams({
          req: { method: 'POST' } as any,
          query: { questionId: 'otherQuestionId' },
        })
      );

      expect(result).toEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/build-application/testAppId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });
  });

  describe('Preview view', () => {
    it('Should render a title', () => {
      render(
        <EligibilityStatement
          {...getMockSchemeParams({ applicationStatus: 'PUBLISHED' })}
        />
      );

      screen.getByText('How this will look to the applicant');
      screen.getByRole('heading', { name: 'Eligibility criteria' });
    });

    it('Should render a return to application form link', () => {
      render(
        <EligibilityStatement
          {...getMockSchemeParams({ applicationStatus: 'PUBLISHED' })}
        />
      );

      screen.getByRole('link', { name: 'Return to application form' });
    });

    it('Should render the default value prop', () => {
      render(
        <EligibilityStatement
          {...getMockSchemeParams({
            applicationStatus: 'PUBLISHED',
            defaultValue: 'Test test test',
          })}
        />
      );

      screen.getByText('Test test test');
    });
  });

  it('Renders the question page layout', () => {
    render(<EligibilityStatement {...getMockSchemeParams()} />);
    screen.getByTestId('question-page-form');
  });
});
