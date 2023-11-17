import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { completedMandatoryQuestions } from '../../../services/MandatoryQuestionsService';
import {
  getGrantScheme,
  schemeApplicationIsInternal,
} from '../../../services/SchemeService';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import Scheme from '../../../types/Scheme';
import ManageDueDiligenceChecks, {
  getServerSideProps,
} from './manage-due-diligence-checks.page';

const APPLICATION_ID = '1';
const SCHEME_ID = '2';

const scheme = {
  name: 'schemeName',
  schemeId: SCHEME_ID,
  ggisReference: '',
  funderId: '',
  createdDate: '',
  version: '2',
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
  });

  describe('Manage due diligence checks page', () => {
    it('Should render back button', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={false}
          spotlightUrl="url"
          isInternal={true}
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
          spotlightUrl="url"
          isInternal={true}
        />
      );
      screen.getByRole('heading', { name: 'Manage due diligence checks' });
    });

    it('Should render the paragraphs when the scheme has no internal applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={false}
        />
      );
      screen.getByText(
        /we gather the information you need to run due diligence checks\./i
      );
      screen.getByText(
        /you can use the government-owned due diligence tool ‘spotlight’ to run your due diligence checks\. the information is already in the correct format to upload directly into spotlight\./i
      );
    });

    it('Should render the paragraphs when the scheme has an internal application', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={true}
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

    it('Should render the paragraphs when the scheme has an internal application', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={true}
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

    it('Should render the download link', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={true}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Download due diligence information' })
      ).toHaveAttribute(
        'href',
        `/apply/api/downloadDueDiligenceChecks?schemeId=${SCHEME_ID}`
      );
    });

    it('Should render the Spotlight button for schemes with external applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={false}
        />
      );

      expect(
        screen.getByRole('link', { name: 'Log in to Spotlight' })
      ).toHaveAttribute('href', `url`);
    });

    it('Should render the Spotlight button for schemes with internal applications', () => {
      render(
        <ManageDueDiligenceChecks
          scheme={scheme}
          hasInfoToDownload={true}
          spotlightUrl="url"
          isInternal={true}
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
          spotlightUrl="url"
          isInternal={true}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Back to grant summary' })
      ).toHaveAttribute('href', `/apply/scheme/${SCHEME_ID}`);
    });
  });
});
