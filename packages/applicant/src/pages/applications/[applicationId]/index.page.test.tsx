import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { GrantScheme } from '../../../types/models/GrantScheme';
import { getApplicationById } from '../../../services/ApplicationService';
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
import { GrantApplication } from '../../../types/models/GrantApplication';
import { HEADERS } from '../../../utils/constants';

jest.mock('../../../utils/parseBody');
jest.mock('../../../services/SubmissionService');
jest.mock('../../../services/ApplicationService');
jest.mock('../../../utils/jwt');

const mockData = {
  submissionCreated: 'string',
  submissionId: '1',
  message: 'message',
};

const context = {
  params: {
    applicationId: '1',
  },
  req: {
    csrfToken: () => 'testCSRFToken',
    headers: { [HEADERS.CORRELATION_ID]: 'test-id' },
  },
  res: {},
} as unknown as GetServerSidePropsContext;

const props = {
  redirect: {
    destination: routes.nameSubmission('1'),
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
    destination: routes.nameSubmission('1'),
    permanent: false,
  },
};
const propsSubmissionExistsRedirect = {
  redirect: {
    destination: routes.nameSubmission('1'),
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
const application: GrantApplication = {
  id: '1',
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
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        allowsMultipleSubmissions: true,
      });
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        grantScheme: scheme,
      });
      const response = await getServerSideProps(context);

      expect(response).toEqual(props);
      // Version 1 redirects to name-submission page without calling createSubmission
      expect(createSubmission).not.toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to submission page if submission does not  exists when application has scheme 1 version and ', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        allowsMultipleSubmissions: true,
      });
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        grantScheme: scheme,
      });

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsSubmissionDoesNotExistsRedirect);
      // Version 1 redirects to name-submission page without calling createSubmission
      expect(createSubmission).not.toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to applications dashboard if submission already exists when application has scheme 1 version', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        allowsMultipleSubmissions: true,
      });
      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        grantScheme: scheme,
      });

      const response = await getServerSideProps(context);

      expect(response).toEqual(propsSubmissionExistsRedirect);
      // Version 1 redirects to name-submission page without calling createSubmission
      expect(createSubmission).not.toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });

    it('should redirect to grant is closed page if grant is closed', async () => {
      (getApplicationById as jest.Mock).mockReturnValue(application);
      // getGrantSchemeById throws grantClosed error before version check
      const getGrantScheme =
        spiedGetGrantSchemeById.mockRejectedValue(grantClosed);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

      const response = await getServerSideProps(context);

      // Error happens before version check, so it goes to catch block
      // and redirects to grant-is-closed page
      expect(response).toEqual(propsGrantClosedError);
      // createSubmission is never called because error happens before version check
      expect(createSubmission).not.toHaveBeenCalled();
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
        grantScheme: { ...scheme, version: 2 },
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
        grantScheme: { ...scheme, version: 2 },
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

    it('should redirect to name-submission page when application has scheme 2 version and mandatory question exist and it is completed', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getApplicationById as jest.Mock).mockReturnValue({
        ...application,
        grantScheme: { ...scheme, version: 2 },
        allowsMultipleSubmissions: true,
      });

      const getGrantScheme = spiedGetGrantSchemeById.mockResolvedValue({
        grantScheme: { ...scheme, version: 2 },
      });
      const existBySchemeIdAndApplicantId =
        spiedExistBySchemeIdAndApplicantId.mockResolvedValue(true);
      const getMandatoryQuestionBySchemeId =
        spiedGetMandatoryQuestionBySchemeId.mockResolvedValue({
          ...mandatoryQuestionData,
          submissionId: '1',
          status: 'COMPLETED',
        });

      const response = await getServerSideProps(context);

      expect(response).toEqual({
        redirect: {
          destination: routes.nameSubmission('1'),
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
      // For version 1, getGrantSchemeById throws an error
      const getGrantScheme = spiedGetGrantSchemeById.mockRejectedValue(
        new Error('Test error')
      );
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

      const response = await getServerSideProps(context);

      // For version 1, even with errors, it redirects to name-submission
      // (the error happens after version check, so it goes to catch block)
      expect(response).toEqual(propsUnknownError);
      // Version 1 redirects to name-submission page without calling createSubmission
      expect(createSubmission).not.toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalled();
      expect(getGrantScheme).toHaveBeenCalledWith('1', 'testJwt');
    });
  });
});
