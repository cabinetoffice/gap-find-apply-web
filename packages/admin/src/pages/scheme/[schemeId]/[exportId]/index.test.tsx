import '@testing-library/jest-dom';

import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';

import { getExportDetails } from '../../../../services/ExportService';
import { getGrantScheme } from '../../../../services/SchemeService';
import { getCompletedSubmissionExportList } from '../../../../services/SubmissionsService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import CompletedSubmissions, { getServerSideProps } from './index.page';

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
      res: {
        getHeader: () => 'testCSRFToken',
      },
      resolvedUrl: '/testResolvedURL',
    } as unknown as GetServerSidePropsContext,
    overrides
  );

const defaultAvailableCount = 11;
const defaultUnavailableCount = 12;
const schemeName = 'Test Scheme';
const sampleUnavailableSubmission = {
  name: 'Test Submission',
  zipFileLocation: '4321/location.zip',
  submissionId: '090aa6ef-c8b0-4c8c-a94c-389985f2c753',
  status: 'FAILED',
  submittedDate: '2023-12-11T16:18:58.576Z',
};

const unavailableSubmissionsList = Array(11).fill(sampleUnavailableSubmission);

const customProps = {
  formAction: '',
  csrfToken: 'testCSRFToken',
  schemeName: schemeName,
  individualApplicationsHref: '/download-individual',
  availableSubmissionsTotalCount: defaultAvailableCount,
  unavailableSubmissionsTotalCount: defaultUnavailableCount,
  unavailableSubmissions: unavailableSubmissionsList,
  superZipLocation: '1234/location.zip',
  schemeId: SCHEME_ID,
  exportId: EXPORT_ID,
};

const exportDetails = {
  grantExportId: '0fe53030-b7ce-4338-b46c-14c452b22ee9',
  failedCount: defaultUnavailableCount,
  successCount: defaultAvailableCount,
  superZipFileLocation: '1234/location.zip',
  exportedSubmissions: unavailableSubmissionsList,
};

const component = <CompletedSubmissions {...customProps} />;

describe('Download all submissions page', () => {
  describe('UI', () => {
    describe('Both available and unavailable submissions', () => {
      beforeEach(() => {
        render(component);
      });

      it('Should render a meta title correctly', () => {
        expect(document.title).toBe('Download applications - Manage a grant');
      });

      it('Should render the page title', () => {
        screen.getByText('Applications submitted');
      });

      it('Should render the grant name', () => {
        screen.getByText(schemeName);
      });

      it('Should render the available count of applications', () => {
        screen.getByText(defaultAvailableCount + ' applications');
      });

      it('Should render the two buttons', async () => {
        screen.getByText('Download all applications');
        screen.getByText('View individual applications');
      });

      it('Should render the unavailable applications view', () => {
        screen.getByText('Unavailable applications');
      });

      it('Should render the unavailable count of applications', () => {
        screen.getByText(defaultUnavailableCount + ' applications');
      });

      it('Should render the table heading(s)', () => {
        screen.getByText('Organisation');
      });

      it('Should render the org names of the unavailable submissions', () => {
        screen.getAllByText(sampleUnavailableSubmission.name);
      });

      it('Should render the unavailable submissions', () => {
        expect(
          screen.getAllByText(sampleUnavailableSubmission.name).length
        ).toEqual(unavailableSubmissionsList.length);
      });

      it('Renders the unavailable submissions banner', () => {
        screen.getByText('Important');
        screen.getByText(
          'You can view a read-only copy of the applications that are affected in the "Applications unavailable for download" section of this page.'
        );
      });
    });

    describe('Available submissions only', () => {
      beforeEach(() => {
        const availableOnlyProps = customProps;
        availableOnlyProps.unavailableSubmissionsTotalCount = 0;
        availableOnlyProps.unavailableSubmissions = [];

        const availableOnlyComponent = (
          <CompletedSubmissions {...availableOnlyProps} />
        );

        render(availableOnlyComponent);
      });

      it('Should render the available count of applications', () => {
        screen.getByText(defaultAvailableCount + ' applications');
      });

      it('Does not render the unavailable submissions table', () => {
        expect(screen.queryByText('Unavailable submissions')).toBeNull();
      });

      it('Does not render the unavailable submissions banner', () => {
        expect(screen.queryByText('Important')).toBeNull();
        expect(
          screen.queryByText(
            'You can view a read-only copy of the applications that are affected in the "Applications unavailable for download" section of this page.'
          )
        );
      });
    });

    describe('Unavailable submissions only', () => {
      beforeEach(() => {
        const unavailableOnlyProps = customProps;
        unavailableOnlyProps.availableSubmissionsTotalCount = 0;
        unavailableOnlyProps.unavailableSubmissions =
          unavailableSubmissionsList;
        unavailableOnlyProps.unavailableSubmissionsTotalCount =
          defaultUnavailableCount;

        const unavailableOnlyComponent = (
          <CompletedSubmissions {...unavailableOnlyProps} />
        );

        render(unavailableOnlyComponent);
      });

      it('Renders correct information about submissions', () => {
        screen.getByText('0 applications');
      });

      it('Should render the unavailable applications view', () => {
        screen.getByText('Unavailable applications');
      });

      it('Should render the unavailable count of applications', () => {
        screen.getByText(defaultUnavailableCount + ' applications');
      });

      it('Should render the table heading(s)', () => {
        screen.getByText('Organisation');
      });

      it('Should render the org names of the unavailable submissions', () => {
        screen.getAllByText(sampleUnavailableSubmission.name);
      });

      it('Should render the unavailable submissions', () => {
        expect(
          screen.getAllByText(sampleUnavailableSubmission.name).length
        ).toEqual(unavailableSubmissionsList.length);
      });

      it('Should render the View link for each unavailable submission', () => {
        expect(screen.getAllByText('View').length).toEqual(11);
      });

      it('Renders the unavailable submissions banner', () => {
        screen.getByText('Important');
        screen.getByText(
          'You can view a read-only copy of the applications that are affected in the "Applications unavailable for download" section of this page.'
        );
      });

      it('Buttons are disabled', () => {
        const downloadAllLink = screen.getByRole('button', {
          name: 'Download all applications',
        });
        expect(downloadAllLink).toHaveAttribute('disabled');
        const downloadIndividualLink = screen.getByRole('button', {
          name: 'View individual applications',
        });
        expect(downloadIndividualLink).toHaveAttribute('disabled');
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

      it('Should return available and unavailable submission counts', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.unavailableSubmissionsTotalCount).toEqual(
          defaultUnavailableCount
        );
        expect(result.props.availableSubmissionsTotalCount).toEqual(
          defaultAvailableCount
        );
      });

      it('Should return unavailable submissions details', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.unavailableSubmissions).toEqual(
          unavailableSubmissionsList
        );
      });

      it('Should return csrf token', async () => {
        const result = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.csrfToken).toEqual('testCSRFToken');
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
              '/service-error?serviceErrorProps={"errorInformation":"There are no submissions available to view or download.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });
  });
});
