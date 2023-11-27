import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import {
  getSpotlightLastUpdateDate,
  getSpotlightSubmissionCount,
} from '../../../services/SpotlightSubmissionService';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import Scheme from '../../../types/Scheme';
import ManageDueDiligenceChecks, {
  getServerSideProps,
} from './manage-due-diligence-checks.page';

const APPLICATION_ID = '1';
const SCHEME_ID = '2';
const SPOTLIGHT_LAST_UPDATED = '23 September 2023';

const scheme = {
  name: 'schemeName',
  schemeId: SCHEME_ID,
  ggisReference: '',
  funderId: '',
  createdDate: '',
  version: '2',
} as Scheme;

const spotlightErrors = {
  errorCount: 0,
  errorStatus: 'API',
  errorFound: false,
} as SpotlightError;

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: SCHEME_ID,
      },
      query: {
        applicationId: APPLICATION_ID,
        hasCompletedSubmissions: true,
      },
      req: {
        headers: {
          referer: '/test-referer',
        },
        cookies: { 'gap-test': 'testSessionId' },
      },
    },
    overrides
  );

jest.mock('../../../services/SchemeService');
jest.mock('../../../services/MandatoryQuestionsService');
jest.mock('../../../services/SpotlightSubmissionService');

describe('scheme/[schemeId]/manage-due-diligence-checks', () => {
  describe('getServerSideProps', () => {
    const mockedGetScheme = getGrantScheme as jest.MockedFn<
      typeof getGrantScheme
    >;
    const mockedSchemeApplicationIsInternal =
      schemeApplicationIsInternal as jest.MockedFn<
        typeof schemeApplicationIsInternal
      >;

    it('Should get the scheme id from the path param', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.scheme).toStrictEqual(scheme);
    });

    it('Should get hasInfoToDownload false from completedMandatoryQuestions', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      (completedMandatoryQuestions as jest.Mock).mockReturnValue(false);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.hasInfoToDownload).toBeFalsy();
    });

    it('Should get spotlightSubmissionCount from getSpotlightSubmissionCount', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      (schemeApplicationIsInternal as jest.Mock).mockReturnValue(true);
      (getSpotlightSubmissionCount as jest.Mock).mockReturnValue('2');

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.spotlightSubmissionCount).toBe('2');
    });

    it('Should get spotlightLastUpdated from getSpotlightLastUpdateDate', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      (schemeApplicationIsInternal as jest.Mock).mockReturnValue(true);
      (getSpotlightLastUpdateDate as jest.Mock).mockReturnValue(
        SPOTLIGHT_LAST_UPDATED
      );

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.spotlightLastUpdated).toBe(SPOTLIGHT_LAST_UPDATED);
    });
  });

  describe('Manage due diligence checks page', () => {
    it('Should render back button', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        `/apply/scheme/${SCHEME_ID}`
      );
    });

    it('Should render the heading', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );
      screen.getByRole('heading', { name: 'Manage due diligence checks' });
    });

    it('Should render the paragraphs when the scheme has no internal applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={false}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );
      screen.getByText(
        /Data is gathered from applicants before they are sent to your application form\./i
      );
      screen.getByText(
        /You may wish to use this data to run due diligence checks\./i
      );
    });

    it('Should render the paragraphs when the scheme has an internal application', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );
      screen.getByText(
        /Your application form has been designed to capture all of the information you need to run due diligence checks in Spotlight, a government owned due diligence tool\./i
      );
      screen.getByText(
        /We automatically send the information to Spotlight. You need to log in to Spotlight to run your checks\./i
      );
      screen.getByText(
        /Spotlight does not run checks on individuals or local authorities\./i
      );
    });

    it('Should render Spotlight submission info if there are successful submissions', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          hasSpotlightDataToDownload={true}
          ggisSchemeRefUrl={''}
          spotlightErrors={spotlightErrors}
        />
      );

      expect(screen.getByTestId('spotlight-count')).toHaveTextContent(
        'You have 2 applications in Spotlight.'
      );
      expect(screen.getByTestId('spotlight-last-updated')).toHaveTextContent(
        'Spotlight was last updated on 23 September 2023.'
      );
    });
    it('Should render Spotlight submission info if no successful submissions', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={''}
          spotlightUrl="url"
          isInternal={true}
          hasSpotlightDataToDownload={true}
          ggisSchemeRefUrl={''}
          spotlightErrors={spotlightErrors}
        />
      );
      expect(screen.getByTestId('spotlight-count')).toHaveTextContent(
        'You have 0 applications in Spotlight'
      );
      expect(screen.getByTestId('spotlight-last-updated')).toHaveTextContent(
        'No records have been sent to Spotlight.'
      );
    });

    it('Should render the paragraphs when the scheme has an internal application', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );
      screen.getByText(
        /Your application form has been designed to capture all of the information you need to run due diligence checks in Spotlight, a government owned due diligence tool\./i
      );
      screen.getByText(
        /We automatically send the information to Spotlight. You need to log in to Spotlight to run your checks\./i
      );
      screen.getByText(
        /Spotlight does not run checks on individuals or local authorities\./i
      );
    });

    it('Should render the spotlight checks download paragraphs', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          hasSpotlightDataToDownload={true}
          ggisSchemeRefUrl={''}
          spotlightErrors={spotlightErrors}
        />
      );

      screen.queryByText(
        /You can download the information you need to run checks to upload it to Spotlight manually\./i
      );
      screen.getByText(
        /if you do not use spotlight, you can download all of the due diligence information to run checks in another service\./i
      );
    });

    it('Should render the spotlight checks download link', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          hasSpotlightDataToDownload={true}
          ggisSchemeRefUrl={''}
          spotlightErrors={spotlightErrors}
        />
      );

      expect(
        screen.getByRole('link', {
          name: 'download the information you need to run checks',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/downloadSpotlightChecks?schemeId=${SCHEME_ID}`
      );
    });

    it('Should not render the spotlight checks download link if there is nothing to download', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          hasSpotlightDataToDownload={false}
          ggisSchemeRefUrl={''}
          spotlightErrors={spotlightErrors}
        />
      );

      expect(
        screen.queryByText('download the information you need to run checks')
      ).not.toBeInTheDocument();
    });

    it('Should render the download link', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );

      expect(
        screen.getByRole('link', {
          name: 'Download checks from applications',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/downloadDueDiligenceChecks?schemeId=${SCHEME_ID}`
      );
    });

    it('Should not render the Spotlight button for schemes with external applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={false}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );

      expect(screen.queryByText('Log in to Spotlight')).not.toBeInTheDocument();
    });

    it('Should render the Spotlight button for schemes with internal applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Log in to Spotlight' })
      ).toHaveAttribute('href', `url`);
    });

    it('Should render the download "back to grant summary" button', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          hasSpotlightDataToDownload={true}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Back to grant summary' })
      ).toHaveAttribute('href', `/apply/scheme/${SCHEME_ID}`);
    });

    it('Should not show the Spotlight error banner if no errors have been found', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={spotlightErrors}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={undefined}
          hasSpotlightDataToDownload={false}
        />
      );

      expect(screen.queryByTestId('spotlight-banner')).toBe(null);
    });

    it('Should show the Spotlight outage error banner if the API error is returned', () => {
      const apiError = {
        errorCount: 1,
        errorStatus: 'API',
        errorFound: true,
      };

      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={apiError}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={undefined}
          hasSpotlightDataToDownload={false}
        />
      );

      screen.getByText("We can't send your data to Spotlight");
    });

    it('Should show the Spotlight GGIS reference error banner if the GGIS error is returned', () => {
      const ggisError = {
        errorCount: 1,
        errorStatus: 'GGIS',
        errorFound: true,
      };

      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={ggisError}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={undefined}
          hasSpotlightDataToDownload={false}
        />
      );

      screen.getByText('Spotlight did not recognise your GGIS number');
    });

    it('Should show the Spotlight Outdated Format error banner if the VALIDATION error is returned', () => {
      const validationError = {
        errorCount: 1,
        errorStatus: 'VALIDATION',
        errorFound: true,
      } as SpotlightError;

      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightUrl="url"
          isInternal={true}
          ggisSchemeRefUrl="url"
          spotlightErrors={validationError}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={undefined}
          hasSpotlightDataToDownload={false}
        />
      );

      screen.getByText('Automatic uploads are not running');
    });
  });
});
