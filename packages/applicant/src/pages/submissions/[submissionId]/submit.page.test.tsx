import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { parseBody } from '../../../utils/parseBody';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import {
  hasSubmissionBeenSubmitted,
  isSubmissionReady,
  submit,
} from '../../../services/SubmissionService';
import { createMockRouter } from '../../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../../utils/jwt';
import SubmitApplication, { getServerSideProps } from './submit.page';

jest.mock('../../../services/SubmissionService');
jest.mock('../../../utils/jwt');
jest.mock('../../../utils/parseBody');
jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
      subPath: '',
    },
    publicRuntimeConfig: {
      subPath: '',
    },
  };
});

const mockedParseBody = jest.mocked(parseBody);

const submissionId = '12345678';
const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        submissionId: submissionId,
      },
      req: {
        method: 'GET',
      },
      res: {
        getHeader: () => 'testCSRFToken',
      },
    },
    overrides
  );

const getContextNoToken = (overrides: any = {}) =>
  merge(
    {
      params: {
        submissionId: submissionId,
      },
      req: {
        method: 'GET',
      },
      res: {
        getHeader: () => '',
      },
    },
    overrides
  );

beforeEach(() => {
  jest.resetAllMocks();
});

describe('getServerSideProps', () => {
  it('should return submissionId', async () => {
    (isSubmissionReady as jest.Mock).mockResolvedValue(true);
    (hasSubmissionBeenSubmitted as jest.Mock).mockResolvedValue(false);

    const response = await getServerSideProps(getContext());

    expect(response).toEqual({
      props: {
        submissionId: submissionId,
        csrfToken: 'testCSRFToken',
      },
    });
  });

  it('should return submissionId with no token', async () => {
    (isSubmissionReady as jest.Mock).mockResolvedValue(true);
    (hasSubmissionBeenSubmitted as jest.Mock).mockResolvedValue(false);

    const response = await getServerSideProps(getContextNoToken());

    expect(response).toEqual({
      props: {
        submissionId: submissionId,
        csrfToken: '',
      },
    });
  });

  it('should redirect back to the sections page if submission is not ready', async () => {
    (isSubmissionReady as jest.Mock).mockResolvedValue(false);
    (hasSubmissionBeenSubmitted as jest.Mock).mockResolvedValue(false);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(getContext());

    expect(response).toEqual({
      redirect: {
        destination: `/submissions/${submissionId}/sections`,
        statusCode: 302,
      },
    });
  });

  it('should redirect back to the sections page if submission has already been submitted', async () => {
    (isSubmissionReady as jest.Mock).mockResolvedValue(true);
    (hasSubmissionBeenSubmitted as jest.Mock).mockResolvedValue(true);

    const response = await getServerSideProps(getContext());

    expect(response).toEqual({
      redirect: {
        destination: `/submissions/${submissionId}/sections`,
        statusCode: 302,
      },
    });
  });

  describe('When handling a POST request', () => {
    const getPostContext = (overrides: any = {}) =>
      merge(getContext({ req: { method: 'POST' } }), overrides);

    beforeEach(() => {
      (submit as jest.Mock).mockResolvedValue('');
      mockedParseBody.mockResolvedValue({});
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
    });

    it('Should attempt to submit the application', async () => {
      const response = await getServerSideProps(getPostContext());

      expect(response).toStrictEqual({
        redirect: {
          statusCode: 302,
          destination: `/submissions/${submissionId}/equality-and-diversity`,
        },
      });
      expect(submit as jest.Mock).toHaveBeenNthCalledWith(
        1,
        submissionId,
        'testJwt'
      );
    });

    it('Should redirect to the error service page when submitting fails', async () => {
      (submit as jest.Mock).mockRejectedValue('');

      const response = await getServerSideProps(getPostContext());

      expect(response).toStrictEqual({
        redirect: {
          statusCode: 302,
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to submit your application","linkAttributes":{"href":"/submissions/${submissionId}/submit","linkText":"Please return","linkInformation":" and try again."}}`,
        },
      });
    });
  });
});

describe('Submit application', () => {
  beforeEach(async () => {
    render(
      <RouterContext.Provider
        value={createMockRouter({
          pathname: `/submissions/${submissionId}/submit`,
        })}
      >
        <SubmitApplication
          submissionId={submissionId}
          csrfToken="testCSRFToken"
        />
      </RouterContext.Provider>
    );
  });
  it('should render page heading', () => {
    screen.getByRole('heading', {
      name: 'Are you sure you want to submit this application?',
    });
  });

  it('should render page description', () => {
    expect(
      screen.getByText(
        'You will not be able to make changes to your application after this has been submitted.'
      )
    ).toBeDefined();
  });

  it('should render button', () => {
    expect(
      screen.getByRole('button', {
        name: 'Yes, submit this application',
      })
    ).toBeDefined();
  });

  it('should render cancel link', () => {
    expect(screen.getByRole('link', { name: 'Cancel' })).toHaveProperty(
      'href',
      `http://localhost/submissions/${submissionId}/summary`
    );
  });
});
