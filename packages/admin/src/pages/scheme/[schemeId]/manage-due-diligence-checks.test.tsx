import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import { getGrantScheme } from '../../../services/SchemeService';
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

const schemeV1 = {
  name: 'schemeName',
  schemeId: SCHEME_ID,
  ggisReference: '',
  funderId: '',
  createdDate: '',
  version: '1',
} as Scheme;

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: SCHEME_ID,
      },
      query: {
        applicationId: APPLICATION_ID,
        hasCompletedSubmissions: true,
        isInternal: 'true',
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

    it('Should get the scheme id from the path param', async () => {
      mockedGetScheme.mockResolvedValue(schemeV1);
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.scheme).toStrictEqual(schemeV1);
    });

    it('Should get the application id from the query param', async () => {
      mockedGetScheme.mockResolvedValue(schemeV1);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.applicationId).toStrictEqual(APPLICATION_ID);
    });

    it('Should get isInternal from the query param', async () => {
      mockedGetScheme.mockResolvedValue(schemeV1);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.isInternal).toBeTruthy();
    });

    it('Should get hasInfoToDownload from the query param', async () => {
      mockedGetScheme.mockResolvedValue(schemeV1);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.hasInfoToDownload).toStrictEqual(false);
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
      (getSpotlightSubmissionCount as jest.Mock).mockReturnValue('2');

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.spotlightSubmissionCount).toBe('2');
    });

    it('Should get spotlightLastUpdated from getSpotlightLastUpdateDate', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
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
          applicationId={APPLICATION_ID}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
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
          applicationId={APPLICATION_ID}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
        />
      );
      screen.getByRole('heading', { name: 'Manage due diligence checks' });
    });

    it('Should render the paragraphs', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          applicationId={APPLICATION_ID}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
        />
      );
      screen.getByText(
        /we gather the information you need to run due diligence checks\./i
      );
      screen.getByText(
        /you can use the government-owned due diligence tool ‘spotlight’ to run your due diligence checks\. the information is already in the correct format to upload directly into spotlight\./i
      );
    });

    it('Should render Spotlight submission info if there are successful submissions', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          applicationId={APPLICATION_ID}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
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
          applicationId={APPLICATION_ID}
          hasInfoToDownload={true}
          spotlightSubmissionCount={0}
          spotlightLastUpdated={null}
          isInternal={'true'}
        />
      );
      expect(screen.getByTestId('spotlight-count')).toHaveTextContent(
        'You have 0 applications in Spotlight'
      );
      expect(screen.getByTestId('spotlight-last-updated')).toHaveTextContent(
        'No records have been sent to Spotlight.'
      );
    });

    it('Should render the download link for v2 schemes', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          applicationId={APPLICATION_ID}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Download due diligence information' })
      ).toHaveAttribute(
        'href',
        `/apply/api/downloadDueDiligenceChecks?schemeId=${SCHEME_ID}`
      );
    });

    it('Should render the download link for v1 schemes', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={schemeV1}
          applicationId={APPLICATION_ID}
          hasInfoToDownload={true}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Download due diligence information' })
      ).toHaveAttribute(
        'href',
        `/apply/api/downloadRequiredChecks?applicationId=${APPLICATION_ID}`
      );
    });

    it('Should render the download "back to grant summary" button', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          applicationId={APPLICATION_ID}
          hasInfoToDownload={false}
          spotlightSubmissionCount={2}
          spotlightLastUpdated={SPOTLIGHT_LAST_UPDATED}
          isInternal={'true'}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Back to grant summary' })
      ).toHaveAttribute('href', `/apply/scheme/${SCHEME_ID}`);
    });
  });
});
