import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { GrantScheme } from '../../../models/GrantScheme';
import {
  Application,
  getApplicationById,
} from '../../../services/ApplicationService';
import {
  GrantMandatoryQuestionDto,
  GrantMandatoryQuestionService,
} from '../../../services/GrantMandatoryQuestionService';
import { GrantSchemeService } from '../../../services/GrantSchemeService';
import {
  CreateSubmissionResponse,
  createSubmission,
} from '../../../services/SubmissionService';
import { getJwtFromCookies } from '../../../utils/jwt';
import { routes } from '../../../utils/routes';
import { getServerSideProps } from './index.page';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../services/SubmissionService');
jest.mock('../../../services/ApplicationService');
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

const propsSubmissionDoesNotExistsRedirect = {
  redirect: {
    destination: routes.submissions.sections('1'),
    permanent: false,
  },
};
const propsSubmissionExistsRedirect = {
  redirect: {
    destination: routes.applications,
    permanent: false,
  },
};
const submissionDoesNotExists: CreateSubmissionResponse = {
  submissionId: '1',
  submissionCreated: true,
};

const submissionExists: CreateSubmissionResponse = {
  submissionId: '1',
  submissionCreated: false,
};
const grantClosed = {
  response: {
    data: {
      code: 'GRANT_NOT_PUBLISHED',
    },
  },
};
const scheme: GrantScheme = {
  id: 1,
  funderId: 1,
  lastUpdated: 'string',
  lastUpdatedBy: 1,
  ggisIdentifier: 'string',
  name: 'string',
  email: 'string',
  version: 1,
  createdDate: 'string',
};
const application: Application = {
  id: 1,
  grantScheme: scheme,
  version: 1,
  created: 'string',
  lastUpdated: 'string',
  lastUpdatedBy: 1,
  applicationName: 'string',
  applicationStatus: 'string',
  definition: 'string',
};
const mandatoryQuestionData: GrantMandatoryQuestionDto = {
  schemeId: 1,
  submissionId: null,
  name: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  county: null,
  postcode: null,
  charityCommissionNumber: null,
  companiesHouseNumber: null,
  orgType: null,
  fundingAmount: null,
  fundingLocation: null,
};

const spiedGetGrantSchemeById = jest.spyOn(
  GrantSchemeService.prototype,
  'getGrantSchemeById'
);
const spiedExistBySchemeIdAndApplicantId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'existBySchemeIdAndApplicantId'
);
const spiedGetMandatoryQuestionBySchemeId = jest.spyOn(
  GrantMandatoryQuestionService.prototype,
  'getMandatoryQuestionBySchemeId'
);

describe('getServerSideProps', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('V1 scenarios', () => {
    it('should return the correct props when application has scheme 1 version', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue(application);
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue(scheme);
      (createSubmission as jest.Mock).mockReturnValue(mockData);
      const response = await getServerSideProps(context);

      expect(response).toEqual(props);
      expect(createSubmission).toHaveBeenCalled();
      expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to submission page if submission does not  exists when application has scheme 1 version and ', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue(application);
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue(scheme);
      (createSubmission as jest.Mock).mockReturnValue(submissionDoesNotExists);

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsSubmissionDoesNotExistsRedirect);
      expect(createSubmission).toHaveBeenCalled();
      expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to applications dashboard if submission already exists when application has scheme 1 version', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue(application);
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue(scheme);
      (createSubmission as jest.Mock).mockReturnValue(submissionExists);

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsSubmissionExistsRedirect);
      expect(createSubmission).toHaveBeenCalled();
      expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to grant is closed page if grant is closed', async () => {
      (getApplicationById as jest.Mock).mockReturnValue(application);
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue(scheme);
      (createSubmission as jest.Mock).mockImplementation(() => {
        throw grantClosed;
      });
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsGrantClosedError);
      expect(createSubmission).toHaveBeenCalled();
      expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });
  });

  describe('V2 scenarios', () => {
    it('should return the the mandatory question start page when application has scheme 2 version and mandatory question does not exist', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        grantScheme: { ...scheme, version: 2 },
      });
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        ...scheme,
        version: 2,
      });
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(false);
      const response = await getServerSideProps(context);

      expect(response).toEqual({
        redirect: {
          destination: routes.mandatoryQuestions.startPage('1'),
          permanent: false,
        },
      });
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
    });

    it('should return the the mandatory question start page when application has scheme 2 version and mandatory question exist but is not completed', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        grantScheme: { ...scheme, version: 2 },
      });

      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        ...scheme,
        version: 2,
      });
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue(
          mandatoryQuestionData
        );

      const response = await getServerSideProps(context);

      expect(response).toEqual({
        redirect: {
          destination: routes.mandatoryQuestions.startPage('1'),
          permanent: false,
        },
      });
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalled();
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalledWith(
        'testJwt',
        '1'
      );
    });

    it('should return the the submission page page when application has scheme 2 version and mandatory question exist and it is completed', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        grantScheme: { ...scheme, version: 2 },
      });

      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        ...scheme,
        version: 2,
      });
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue({
          ...mandatoryQuestionData,
          submissionId: '1',
        });

      const response = await getServerSideProps(context);

      expect(response).toEqual({
        redirect: {
          destination: routes.submissions.sections('1'),
          permanent: false,
        },
      });
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalled();
      expect(existBySchemeIdAndApplicantId).toHaveBeenCalledWith(
        '1',
        'testJwt'
      );
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalled();
      expect(getMandatoryQuestionBySchemeId).toHaveBeenCalledWith(
        'testJwt',
        '1'
      );
    });
  });
  describe('common scenarios', () => {
    it('should redirect if there is an error', async () => {
      (getApplicationById as jest.Mock).mockReturnValue(application);
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue(scheme);
      (createSubmission as jest.Mock).mockReturnValue(null);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsUnknownError);
      expect(createSubmission).toHaveBeenCalled();
      expect(createSubmission).toHaveBeenCalledWith('1', 'testJwt');
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });
  });
});
