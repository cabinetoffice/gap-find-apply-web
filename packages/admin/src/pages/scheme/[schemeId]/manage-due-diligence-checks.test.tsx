import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { hasCompletedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import {
  GetSpotlightSubmissionDataBySchemeIdDto,
  getSpotlightSubmissionSentData,
} from '../../../services/SpotlightSubmissionService';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import Scheme from '../../../types/Scheme';
import ManageDueDiligenceChecks, {
  getServerSideProps,
} from './manage-due-diligence-checks.page';
import { SpotlightError } from '../../../types/SpotlightError';
import InferProps from '../../../types/InferProps';
import {
  getPageProps,
  renderWithRouter,
} from '../../../testUtils/unitTestHelpers';

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

const internalDueDiligenceData: GetSpotlightSubmissionDataBySchemeIdDto = {
  sentCount: 2,
  sentLastUpdatedDate: SPOTLIGHT_LAST_UPDATED,
  hasSpotlightSubmissions: true,
};

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
jest.mock('../../../services/SpotlightBatchService');

describe('scheme/[schemeId]/manage-due-diligence-checks', () => {
  describe('getServerSideProps', () => {
    const mockedGetScheme = getGrantScheme as jest.MockedFn<
      typeof getGrantScheme
    >;

    it('Should get the scheme id from the path param', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.scheme).toStrictEqual(scheme);
    });

    it('Should get hasInfoToDownload false from hasCompletedMandatoryQuestions', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      (hasCompletedMandatoryQuestions as jest.Mock).mockReturnValue(false);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.hasInfoToDownload).toBeFalsy();
    });

    it('Should get SubmissionCount and lastUpdateDate from getSpotlightSubmissionManageDueDiligenceData', async () => {
      mockedGetScheme.mockResolvedValue(scheme);
      (schemeApplicationIsInternal as jest.Mock).mockReturnValue(true);
      (getSpotlightSubmissionSentData as jest.Mock).mockReturnValue(
        internalDueDiligenceData
      );

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.internalDueDiligenceData.sentCount).toBe(2);
      expect(response.props.internalDueDiligenceData.sentLastUpdatedDate).toBe(
        SPOTLIGHT_LAST_UPDATED
      );
      expect(
        response.props.internalDueDiligenceData.hasSpotlightSubmissions
      ).toBe(true);
    });
  });

  describe('Manage due diligence checks page', () => {
    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      scheme,
      hasInfoToDownload: false,
      internalDueDiligenceData,
      spotlightUrl: 'url',
      isInternal: true,
      ggisSchemeRefUrl: 'url',
      spotlightErrors,
    });

    it('Should render back button', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks {...getPageProps(getDefaultProps)} />
      );
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        `/apply/scheme/${SCHEME_ID}`
      );
    });

    it('Should render the heading', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks {...getPageProps(getDefaultProps)} />
      );
      screen.getByRole('heading', { name: 'Manage due diligence checks' });
    });

    it('Should render the paragraphs when the scheme has no internal applications', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            isInternal: false,
            hasInfoToDownload: true,
          })}
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
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, { hasInfoToDownload: true })}
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
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            ggisSchemeRefUrl: '',
          })}
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
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            ggisSchemeRefUrl: '',
            internalDueDiligenceData: {
              sentCount: 0,
              sentLastUpdatedDate: '',
              hasSpotlightSubmissions: true,
            },
          })}
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
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
          })}
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
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            ggisSchemeRefUrl: '',
          })}
        />
      );

      screen.queryByText(/download the information you need to run checks\./i);
    });

    it('Should render the spotlight checks download link', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            ggisSchemeRefUrl: '',
          })}
        />
      );
      expect(
        screen.getByRole('link', {
          name: 'download the information you need to run checks',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/manage-due-diligence/v2/internal/downloadSpotlightSubmissionsChecks?schemeId=${SCHEME_ID}&onlyValidationErrors=false`
      );
    });

    it('Should not render the Spotlight checks download link if there is nothing to download', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            ggisSchemeRefUrl: '',
            internalDueDiligenceData: {
              ...internalDueDiligenceData,
              hasSpotlightSubmissions: false,
            },
          })}
        />
      );
      expect(
        screen.queryByText('download the information you need to run checks')
      ).not.toBeInTheDocument();
    });

    it('Should render the download link and text for internal applications', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
          })}
        />
      );

      expect(
        screen.getByRole('link', {
          name: 'Download checks from applications',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/manage-due-diligence/v2/downloadAllDueDiligenceChecks?schemeId=${SCHEME_ID}&internal=true`
      );
    });

    it('Should render the download link and text for external applications', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            isInternal: false,
          })}
        />
      );

      expect(
        screen.getByRole('link', {
          name: 'Download due diligence information',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/manage-due-diligence/v2/downloadAllDueDiligenceChecks?schemeId=${SCHEME_ID}&internal=false`
      );
    });

    it('Should not render the Spotlight button for schemes with external applications', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
            isInternal: false,
          })}
        />
      );

      expect(screen.queryByText('Log in to Spotlight')).not.toBeInTheDocument();
    });

    it('Should render the Spotlight button for schemes with internal applications', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            hasInfoToDownload: true,
          })}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Log in to Spotlight' })
      ).toHaveAttribute('href', `url`);
    });

    it('Should render the download "back to grant summary" button', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks {...getPageProps(getDefaultProps)} />
      );

      expect(
        screen.getByRole('button', { name: 'Back to grant summary' })
      ).toHaveAttribute('href', `/apply/scheme/${SCHEME_ID}`);
    });

    it('Should not show the Spotlight error banner if no errors have been found', () => {
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            internalDueDiligenceData: {
              ...internalDueDiligenceData,
              sentLastUpdatedDate: undefined,
              hasSpotlightSubmissions: false,
            },
          })}
        />
      );

      expect(screen.queryByTestId('spotlight-banner')).toBe(null);
    });

    it('Should show the Spotlight outage error banner if the VALIDATION error is returned', () => {
      const validationError: SpotlightError = {
        errorCount: 1,
        errorStatus: 'VALIDATION',
        errorFound: true,
        isValidationErrorPresent: true,
      };
      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            internalDueDiligenceData: {
              sentCount: 0,
              sentLastUpdatedDate: undefined,
              hasSpotlightSubmissions: false,
            },
            spotlightErrors: validationError,
          })}
        />
      );

      screen.getByText("We can't send your data to Spotlight");
    });

    it('Should show the Spotlight GGIS reference error banner if the GGIS error is returned', () => {
      const ggisError: SpotlightError = {
        errorCount: 1,
        errorStatus: 'GGIS',
        errorFound: true,
        isValidationErrorPresent: false,
      };

      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            internalDueDiligenceData: {
              sentCount: 0,
              sentLastUpdatedDate: undefined,
              hasSpotlightSubmissions: false,
            },
            spotlightErrors: ggisError,
          })}
        />
      );

      screen.getByText('Spotlight did not recognise your GGIS number');
    });

    it('Should show the Spotlight Outdated Format error banner if the API error is returned', () => {
      const apiError: SpotlightError = {
        errorCount: 1,
        errorStatus: 'API',
        errorFound: true,
        isValidationErrorPresent: false,
      };

      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            internalDueDiligenceData: {
              sentCount: 0,
              sentLastUpdatedDate: undefined,
              hasSpotlightSubmissions: false,
            },
            spotlightErrors: apiError,
          })}
        />
      );

      screen.getByText('Automatic uploads are not running');
    });

    it('Should show the download failed Spotlight checks link if the VALIDATION error is returned', () => {
      const validationError: SpotlightError = {
        errorCount: 1,
        errorStatus: 'VALIDATION',
        errorFound: true,
        isValidationErrorPresent: true,
      };

      renderWithRouter(
        <ManageDueDiligenceChecks
          {...getPageProps(getDefaultProps, {
            internalDueDiligenceData: {
              sentCount: 1,
              sentLastUpdatedDate: undefined,
              hasSpotlightSubmissions: false,
            },
            spotlightErrors: validationError,
            hasInfoToDownload: true,
          })}
        />
      );

      expect(
        screen.getByRole('link', {
          name: 'download checks that Find a grant cannot send to Spotlight',
        })
      ).toHaveAttribute(
        'href',
        `/apply/api/manage-due-diligence/v2/internal/downloadSpotlightSubmissionsChecks?schemeId=${SCHEME_ID}&onlyValidationErrors=true`
      );
    });
  });
});
