import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { createSubmission } from '../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { getServerSideProps } from './index.page';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../services/SubmissionService');
jest.mock('../../../utils/jwt');
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

const mockData = {
  submissionCreated: 'string',
  submissionId: '1',
  message: 'message',
};

const context = {
  params: {
    applicationId: '1',
  },
  req: { csrfToken: () => 'testCSRFToken' },
  res: {},
} as unknown as GetServerSidePropsContext;

const props = {
  redirect: {
    destination: routes.submissions.sections('1'),
    permanent: false,
  },
};

const propsError = {
  redirect: {
    destination: `/grant-is-closed`,
    permanent: false,
  },
};

const propsSubmissionExistsError = {
  redirect: {
    destination: routes.applications,
    permanent: false,
  },
};
const propsGrantClosedError = {
  redirect: {
    destination: `/grant-is-closed`,
    permanent: false,
  },
};
const propsUnknownError = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create your application","linkAttributes":{"href":"/applications/1/","linkText":"Please return","linkInformation":" and try again."}}`,
    permanent: false,
  },
};
const unknownError = {
  response: {
    data: {
      message: 'Unknown Error',
    },
  },
};
const submissionExists = {
  response: {
    data: {
      code: 'SUBMISSION_ALREADY_CREATED',
    },
  },
};
const grantClosed = {
  response: {
    data: {
      code: 'GRANT_NOT_PUBLISHED',
    },
  },
};
describe('getServerSideProps', () => {
  it('should return the correct props', async () => {
    (createSubmission as jest.Mock).mockReturnValue(mockData);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual(props);
    expect(createSubmission).toHaveBeenCalled();
    expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
  });

  it('should redirect to applications dashboard if submission already exists', async () => {
    (createSubmission as jest.Mock).mockImplementation(() => {
      throw submissionExists;
    });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual(propsSubmissionExistsError);
    expect(createSubmission).toHaveBeenCalled();
    expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
  });

  it('should redirect to grant is closed page if grant is closed', async () => {
    (createSubmission as jest.Mock).mockImplementation(() => {
      throw grantClosed;
    });
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual(propsGrantClosedError);
    expect(createSubmission).toHaveBeenCalled();
    expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
  });

  it('should redirect if there is an error', async () => {
    (createSubmission as jest.Mock).mockReturnValue(null);
    (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

    const response = await getServerSideProps(context);

    expect(response).toEqual(propsUnknownError);
    expect(createSubmission).toHaveBeenCalled();
    expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
  });
});
