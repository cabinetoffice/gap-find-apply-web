import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import DownloadSubmissions, {
  getServerSideProps,
} from './download-submissions.page';
import { merge } from 'lodash';
import { findApplicationFormFromScheme } from '../../../services/SchemeService';
import { getLoggedInUsersDetails } from '../../../services/UserService';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import ExportStatusEnum from '../../../enums/ExportStatus';
import {
  getApplicationExportStatus,
  requestSubmissionsExport,
} from '../../../services/SubmissionsService';
import { parseBody } from '../../../utils/parseBody';

jest.mock('../../../services/SchemeService');
jest.mock('../../../services/ApplicationService');
jest.mock('../../../services/UserService');
jest.mock('../../../services/SubmissionsService');
jest.mock('../../../utils/callServiceMethod');
jest.mock('../../../utils/parseBody');

const mockedFindApplicationFormFromScheme =
  findApplicationFormFromScheme as jest.Mock;

const mockedGetLoggedInUsersDetails = getLoggedInUsersDetails as jest.Mock;

const mockedGetApplicationExportStatus =
  getApplicationExportStatus as jest.Mock;
const mockedRequestSubmissionsExport = requestSubmissionsExport as jest.Mock;

const customProps = {
  backButtonHref: '/back',
  exportStatus: ExportStatusEnum.NOT_STARTED,
  emailAddress: '',
  csrfToken: '',
  formAction: '',
  requested: null,
};

const component = <DownloadSubmissions {...customProps} />;
const SCHEME_ID = 'testSchemeId';

const getContext = (overrides = {}) =>
  merge(
    {
      query: {
        schemeId: SCHEME_ID,
      } as Record<string, string>,
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
        headers: { referer: '/testRefererPage' },
      },
      res: { getHeader: () => 'testCSRFToken' },
      resolvedUrl: '/testResolvedURL',
    } as unknown as GetServerSidePropsContext,
    overrides
  );

const getPostContext = (overrides = {}) =>
  merge(getContext({ req: { method: 'POST' } }), overrides);

describe('Download submissions page', () => {
  describe('UI', () => {
    it('Should have a correct meta title without', () => {
      render(component);
      expect(document.title).toBe('Download applications - Manage a grant');
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/admin/back'
      );
    });

    describe('Export is NOT in progress', () => {
      beforeEach(() => {
        render(component);
      });

      it('Should display correct page title', () => {
        screen.getByRole('heading', { name: 'View your applications' });
      });

      it('Should display main text body', () => {
        screen.getByText(
          'To see who has applied for your grant, you need to view and download your submitted applications.'
        );
        screen.getByText('Get started by requesting a list of applications.');
      });

      it('Should display the download button', () => {
        screen.getByRole('button', { name: 'Download submitted applications' });
      });
    });

    describe('Export is in progress', () => {
      it('Should render a correct confirmation panel', async () => {
        render(
          <DownloadSubmissions
            {...customProps}
            exportStatus={ExportStatusEnum.PROCESSING}
          />
        );

        screen.getByRole('heading', {
          name: 'A list of applications is being created',
        });
      });

      it('Should display main text body', () => {
        render(
          <DownloadSubmissions
            {...customProps}
            exportStatus={ExportStatusEnum.PROCESSING}
            emailAddress="test@email.com"
          />
        );

        screen.getByText('It can take some time to prepare this information.');
        screen.getByText(
          'You do not need to wait here. We will email when the information is ready.'
        );
        screen.getByText('test@email.com');
      });
    });
  });

  describe('getServerSideProps', () => {
    beforeEach(() => {
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        { applicationId: 1, submissionCount: 1 },
      ]);
      mockedGetLoggedInUsersDetails.mockResolvedValue({
        emailAddress: 'test@email.com',
      });
      mockedGetApplicationExportStatus.mockResolvedValue(
        ExportStatusEnum.PROCESSING
      );
      (parseBody as jest.Mock).mockResolvedValue({ testBody: true });
    });

    it('Should NOT return a redirect object if applicationFormsStatus is successfully retrieved', async () => {
      const response = await getServerSideProps(getContext());

      expect(response).not.toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to export submissions.","linkAttributes":{"href":"/testRefererPage","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should return a correct redirect object if applicationFormsStatus throws an error', async () => {
      mockedFindApplicationFormFromScheme.mockRejectedValue({});

      const response = await getServerSideProps(getContext());

      expect(response).toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong. This application has no submissions.","linkAttributes":{"href":"/testRefererPage","linkText":"Please return","linkInformation":" and try again."}}&excludeSubPath=true',
          statusCode: 302,
        },
      });
    });

    it('Should NOT return redirect object if application has submissions', async () => {
      const response = await getServerSideProps(getContext());

      expect(response).not.toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to export submissions.","linkAttributes":{"href":"/testRefererPage","linkText":"Please return","linkInformation":" and try again."}}',
          statusCode: 302,
        },
      });
    });

    it('Should return a correct redirect object if application has no submissions', async () => {
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        { applicationId: 1, submissionCount: 0 },
      ]);
      const response = await getServerSideProps(getContext());

      expect(response).toStrictEqual({
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to export submissions.","linkAttributes":{"href":"/testRefererPage","linkText":"Please return","linkInformation":" and try again."}}&excludeSubPath=true',
          statusCode: 302,
        },
      });
    });

    it('Should return correct backButtonHref', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.backButtonHref).toStrictEqual(
        '/scheme/testSchemeId'
      );
    });

    it('Should return correct exportStatus', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.exportStatus).toStrictEqual(
        ExportStatusEnum.PROCESSING
      );
    });

    describe('POST method', () => {
      beforeEach(() => {
        mockedFindApplicationFormFromScheme.mockResolvedValue([
          { applicationId: 1, submissionCount: 1 },
        ]);
        mockedGetLoggedInUsersDetails.mockResolvedValue({
          emailAddress: 'test@email.com',
        });
        mockedGetApplicationExportStatus.mockResolvedValue(
          ExportStatusEnum.PROCESSING
        );
      });

      it('requestSubmissionsExport is triggered if exportStatus is NOT_STARTED', async () => {
        mockedGetApplicationExportStatus.mockResolvedValue(
          ExportStatusEnum.NOT_STARTED
        );
        (parseBody as jest.Mock).mockResolvedValue({
          'download-submitted-applications': true,
        });

        await getServerSideProps(getPostContext());

        expect(mockedRequestSubmissionsExport).toBeCalledWith('', 1);
      });

      it('requestSubmissionsExport is not triggered if exportStatus is PROCESSING', async () => {
        await getServerSideProps(getPostContext());

        expect(mockedRequestSubmissionsExport).not.toBeCalled();
      });

      it('Should return a user email if export is in progress', async () => {
        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.emailAddress).toStrictEqual('test@email.com');
      });

      it('Should return a correct error redirect object when retrieving user details fails', async () => {
        mockedGetLoggedInUsersDetails.mockRejectedValue({});

        const response = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(response).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to export submissions.","linkAttributes":{"href":"/testRefererPage","linkText":"Please return","linkInformation":" and try again."}}&excludeSubPath=true',
            statusCode: 302,
          },
        });
      });
    });
  });
});
