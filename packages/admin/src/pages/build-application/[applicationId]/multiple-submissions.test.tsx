import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MultipleSubmissionsPage, {
  getServerSideProps,
} from './multiple-submissions.page';
import { updateApplicationMultipleSubmissions } from '../../../services/ApplicationService';
import { ParsedUrlQuery } from 'querystring';
import { GetServerSidePropsContext } from 'next';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import callServiceMethod from '../../../utils/callServiceMethod';

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
jest.mock('../../../utils/session');
jest.mock('../../../utils/callServiceMethod');

const mockedUpdateApplicationMultipleSubmissions =
  updateApplicationMultipleSubmissions as jest.MockedFn<
    typeof updateApplicationMultipleSubmissions
  >;

const mockProps = {
  backButtonHref: '/build-application/test-application-id/dashboard',
  formAction:
    '/apply/build-application/test-application-id/multiple-submissions',
  fieldErrors: [],
  csrfToken: 'testCsrfToken',
  defaultValue: null,
};

const component = <MultipleSubmissionsPage {...mockProps} />;

describe('Multiple submissions page', () => {
  it('Renders the question page layout output', () => {
    render(component);
    screen.getByTestId('question-page-form');
  });

  it('Should render the question title', () => {
    render(component);
    screen.getByText('Can applicants make more than one application?');
  });

  it('Should render the question hint text', () => {
    render(component);
    screen.getByText(
      'This lets the same person apply for this grant more than once.'
    );
  });

  it('Should render Yes and No radio options', () => {
    render(component);
    screen.getByRole('radio', { name: 'Yes, allow multiple applications' });
    screen.getByRole('radio', { name: 'No, allow only one application' });
  });

  it('Should render the continue button', () => {
    render(component);
    screen.getByRole('button', { name: 'Continue' });
  });

  describe('getServerSideProps', () => {
    const mockedCallServiceMethod = callServiceMethod as jest.MockedFn<
      typeof callServiceMethod
    >;

    const getMockContext = () =>
      ({
        params: {
          applicationId: 'test-application-id',
        } as Record<string, string>,
        req: {
          method: 'GET',
          cookies: { 'gap-test': 'testSessionId' },
        },
        res: { getHeader: jest.fn(() => 'testCsrfToken') },
        resolvedUrl:
          '/build-application/test-application-id/multiple-submissions',
      } as unknown as GetServerSidePropsContext);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('Returns correct props on successful load', async () => {
      const mockValidContext = getMockContext();
      mockedCallServiceMethod.mockResolvedValue({ nonPost: true });

      const value = (await getServerSideProps(
        mockValidContext
      )) as NextGetServerSidePropsResponse;

      expect(value.props.backButtonHref).toStrictEqual(
        '/build-application/test-application-id/dashboard'
      );
      expect(value.props.fieldErrors).toStrictEqual([]);
      expect(value.props.csrfToken).toStrictEqual('testCsrfToken');
    });

    it('Should redirect to dashboard after successful submission', async () => {
      const mockValidContext = getMockContext();
      mockedCallServiceMethod.mockResolvedValue({
        redirect: {
          destination: '/build-application/test-application-id/dashboard',
          statusCode: 302,
        },
      });

      const value = await getServerSideProps(mockValidContext);

      expect(value).toHaveProperty('redirect');
      expect((value as any).redirect.destination).toStrictEqual(
        '/build-application/test-application-id/dashboard'
      );
    });

    it('Should return field errors when validation fails', async () => {
      const mockValidContext = getMockContext();
      const fieldErrors = [
        {
          fieldName: 'allowsMultipleSubmissions',
          errorMessage: 'Please select an option',
        },
      ];
      mockedCallServiceMethod.mockResolvedValue({
        body: { allowsMultipleSubmissions: '' },
        fieldErrors,
      });

      const value = (await getServerSideProps(
        mockValidContext
      )) as NextGetServerSidePropsResponse;

      expect(value.props.fieldErrors).toStrictEqual(fieldErrors);
    });
  });
});
