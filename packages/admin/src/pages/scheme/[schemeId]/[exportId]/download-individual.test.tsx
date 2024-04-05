import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';

import {
  ExportDetails,
  getExportDetails,
} from '../../../../services/ExportService';
import { getGrantScheme } from '../../../../services/SchemeService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import DownloadIndividualSubmissions, {
  getServerSideProps,
} from './download-individual.page';
import { merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '',
      replace: jest.fn(),
    };
  },
}));

jest.mock('../../../../utils/general');
jest.mock('../../../../services/SchemeService');
jest.mock('../../../../services/SubmissionsService');
jest.mock('../../../../services/ExportService');

const SCHEME_ID = 'testSchemeId';
const EXPORT_ID = 'testExportId';

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: SCHEME_ID,
        exportId: EXPORT_ID,
      } as Record<string, string>,
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
        headers: { referer: '/testRefererPage' },
      } as any,
      query: {
        page: '1',
      } as any,
    } as unknown as GetServerSidePropsContext,
    overrides
  );

const defaultAvailableCount = 999;
const schemeName = 'Test Scheme';
const backBtnUrl = `/scheme/${SCHEME_ID}/${EXPORT_ID}`;
const sampleSubmission = {
  name: 'Test Submission',
  status: 'COMPLETE',
  submittedDate: '20/10/24',
  zipFileLocation: '4321/location.zip',
  submissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf207',
} as ExportDetails;

const submissionList = Array(10).fill(sampleSubmission);

const exportDetails = {
  grantExportId: '0fe53030-b7ce-4338-b46c-14c452b22ee9',
  failedCount: 0,
  successCount: defaultAvailableCount,
  superZipFileLocation: '1234/superziplocation.zip',
  exportedSubmissions: submissionList,
};

const customProps = {
  schemeName: schemeName,
  availableSubmissionsTotalCount: defaultAvailableCount,
  exportedSubmissions: submissionList,
  backBtnUrl: backBtnUrl,
};

const component = <DownloadIndividualSubmissions {...customProps} />;

describe('Download individual submissions page', () => {
  describe('UI', () => {
    describe('Available submissions only', () => {
      beforeEach(() => {
        render(component);
      });

      it('Should render a meta title correctly', () => {
        expect(document.title).toBe('Download applications - Manage a grant');
      });

      it('Should render the page title', () => {
        screen.getByText('Download individual applications');
      });

      it('Should render the grant name', () => {
        screen.getByText(schemeName);
      });

      it('Should render the downloadable submissions', () => {
        expect(screen.getAllByText('Test Submission')).toHaveLength(10);
        expect(screen.getAllByText('Download')).toHaveLength(10);
      });

      it('Should render total applications', () => {
        screen.getByText(`${defaultAvailableCount}`);
      });

      it('Should render back buttons', () => {
        expect(screen.getByText('Back')).toHaveAttribute(
          'href',
          `/apply${backBtnUrl}`
        );
        expect(screen.getByText('Return to overview')).toHaveAttribute(
          'href',
          `/apply${backBtnUrl}`
        );
      });
    });
  });

  describe('Logic', () => {
    describe('getServerSideProps', () => {
      beforeEach(async () => {
        (getGrantScheme as jest.Mock).mockResolvedValue({
          name: schemeName,
        });
        (getExportDetails as jest.Mock).mockResolvedValue(exportDetails);
      });
      it('Should redirect to an error page if getGrantScheme throws an error', async () => {
        (getGrantScheme as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to view submission applications.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to an error page if the getExportDetails endpoint throws an error', async () => {
        (getExportDetails as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to view submission applications.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });

      it('Should return scheme name', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;
        expect(result.props.schemeName).toStrictEqual(schemeName);
      });

      it('Should return available submission count', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.availableSubmissionsTotalCount).toEqual(
          defaultAvailableCount
        );
      });

      it('Should return submissions details', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.exportedSubmissions).toEqual(submissionList);
      });

      it('Should redirect to an error page if there are no submissions', async () => {
        const zeroSubmissionExportDetails = exportDetails;
        zeroSubmissionExportDetails.failedCount = 0;
        zeroSubmissionExportDetails.successCount = 0;
        (getExportDetails as jest.Mock).mockResolvedValue(
          zeroSubmissionExportDetails
        );

        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"There are no submissions available for download.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });
  });
});
