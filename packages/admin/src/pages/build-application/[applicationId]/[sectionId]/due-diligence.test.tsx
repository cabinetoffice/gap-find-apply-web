import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import axios from 'axios';
import DueDiligence, { getServerSideProps } from './due-diligence.page';
import { merge } from 'lodash';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import { updateSectionStatus } from '../../../../services/SectionService';
import { parseBody } from 'next/dist/server/api-utils/node';

const mockSchemeParams = {
  fieldErrors: [],
  backButtonHref: '',
  formAction: '',
  pageCaption: '',
  sectionQuestions: [],
  defaultCheckboxes: [],
  disabled: false,
};

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
jest.mock('axios');
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../services/SectionService');

const renderComponent = () => render(<DueDiligence {...mockSchemeParams} />);

const getCallParams = (overrides: any = {}) =>
  merge(
    {
      resolvedUrl: '/resolvedUrl',
      params: { applicationId: 'testAppId', sectionId: 'testSectionId' },
      req: { method: 'POST', cookies: { 'gap-test': 'testSessionId' } } as any,
      res: {} as any,
    },
    overrides
  );

const getGetResponse = (overrides: any = {}) =>
  merge(
    {
      data: {
        applicationName: 'Test Application Name',
        sections: [
          {
            sectionId: 'ESSENTIAL',
            sectionTitle: 'Essential Information',
            questions: [
              {
                questionId: 'testQuestionId',
                adminSummary: 'Admin Summary Text',
              },
            ],
          },
        ],
      },
    },
    overrides
  );

describe('Due diligence page', () => {
  describe('UI', () => {
    it('Renders the question page layout', () => {
      renderComponent();
      screen.getByTestId('question-page-form');
    });

    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      renderComponent();
      expect(document.title).toBe(
        'Due-diligence checks - Manage a grant'
      );
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <DueDiligence
          {...mockSchemeParams}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );
      expect(document.title).toBe(
        'Error: Due-diligence checks - Manage a grant'
      );
    });

    it('Should render a back button with correct link on it', () => {
      renderComponent();
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply'
      );
    });

    it('Should render a checkbox input', () => {
      renderComponent();
      screen.getByTestId('checkbox-component');
    });

    it('Should render a button', () => {
      renderComponent();
      screen.getByRole('button', { name: 'Save and exit' });
    });

    it('Should render a return to application form link when disabled is true', () => {
      render(
        <DueDiligence {...mockSchemeParams} applicationStatus="PUBLISHED" />
      );
      screen.getByRole('link', { name: 'Return to application form' });
    });
  });

  describe('getServerSideProps', () => {
    describe('When handling a POST request', () => {
      beforeEach(() => {
        (updateSectionStatus as jest.Mock).mockResolvedValue({});
        (parseBody as jest.Mock).mockResolvedValue({
          confirmation:
            'I understand that applicants will be asked for this information',
        });
        (axios.get as jest.Mock).mockResolvedValue(getGetResponse());
        process.env.SESSION_COOKIE_NAME = 'gap-test';
      });

      it('Throws a validation error when the checkbox has NOT been ticked', async () => {
        (parseBody as jest.Mock).mockResolvedValue({});

        const result = (await getServerSideProps(
          getCallParams()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.fieldErrors).toStrictEqual([
          {
            fieldName: 'confirmation',
            errorMessage:
              'You must confirm that you understand these due-diligence checks.',
          },
        ]);
        expect(updateSectionStatus as jest.Mock).not.toHaveBeenCalled();
      });

      it('Redirects to the dashboard when the checkbox has NOT been ticked AND the section status is "COMPLETE"', async () => {
        (axios.get as jest.Mock).mockResolvedValue(
          getGetResponse({
            data: {
              applicationName: 'Test Application Name',
              sections: [{ sectionStatus: 'COMPLETE' }],
            },
          })
        );
        (parseBody as jest.Mock).mockResolvedValue({});

        const result = (await getServerSideProps(
          getCallParams()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination: `/build-application/testAppId/dashboard`,
            statusCode: 302,
          },
        });
        expect(updateSectionStatus as jest.Mock).not.toHaveBeenCalled();
      });

      it('Redirects to the dashboard and updates the section status when the checkbox has been ticked', async () => {
        const result = await getServerSideProps(getCallParams());

        expect(result).toStrictEqual({
          redirect: {
            destination: `/build-application/testAppId/dashboard`,
            statusCode: 302,
          },
        });
        expect(updateSectionStatus as jest.Mock).toHaveBeenCalledTimes(1);
        expect(updateSectionStatus as jest.Mock).toHaveBeenCalledWith(
          'testSessionId',
          'testAppId',
          'testSectionId',
          'COMPLETE'
        );
      });

      it('Redirects to the error service page when updating the status fails', async () => {
        (updateSectionStatus as jest.Mock).mockRejectedValue({});

        const result = await getServerSideProps(getCallParams());

        expect(result).toStrictEqual({
          redirect: {
            destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the due-diligence checks.","linkAttributes":{"href":"/build-application/testAppId/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
            statusCode: 302,
          },
        });
      });
    });

    it('Redirects to the error page if fetching the application form fails', async () => {
      (axios.get as jest.Mock).mockRejectedValue({});

      const result = await getServerSideProps(
        getCallParams({
          req: { method: 'GET' } as any,
        })
      );

      expect(result).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve the question.","linkAttributes":{"href":"/","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    describe('getServerSideProps props value tests', () => {
      let result: { props: any };

      beforeEach(async () => {
        (axios.get as jest.Mock).mockResolvedValue(getGetResponse());

        result = (await getServerSideProps(
          getCallParams({
            req: { method: 'GET' } as any,
          })
        )) as NextGetServerSidePropsResponse;
      });

      it('should return expected backButtonHref value', async () => {
        expect(result.props.backButtonHref).toStrictEqual(
          '/build-application/testAppId/dashboard'
        );
      });

      it('should return expected fieldErrors value', async () => {
        expect(result.props.fieldErrors).toStrictEqual([]);
      });

      it('should return expected formAction value', async () => {
        expect(result.props.formAction).toStrictEqual('/resolvedUrl');
      });

      it('should return expected pageCaption value', async () => {
        expect(result.props.pageCaption).toStrictEqual('Test Application Name');
      });

      it('should return expected sectionQuestions value', async () => {
        expect(result.props.sectionQuestions).toStrictEqual([
          {
            questionId: 'testQuestionId',
            adminSummary: 'Admin Summary Text',
          },
        ]);
      });

      it('should return expected defaultCheckboxes value', async () => {
        expect(result.props.defaultCheckboxes).toStrictEqual([]);
      });
    });
  });
});
