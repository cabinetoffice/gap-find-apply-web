import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AxiosError } from 'axios';
import { merge } from 'lodash';
import { GetServerSidePropsResult, Redirect } from 'next';
import AdvertStatusEnum from '../../../enums/AdvertStatus';
import { getGrantAdvertPublishInformationBySchemeId } from '../../../services/AdvertPageService';
import { getAdvertPublishInformationBySchemeIdResponse } from '../../../services/AdvertPageService.d';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import {
  findApplicationFormFromScheme,
  getGrantScheme,
} from '../../../services/SchemeService';
import { ApplicationFormSummary } from '../../../types/ApplicationForm';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import Scheme from '../../../types/Scheme';
import ViewScheme, { getServerSideProps } from './index.page';

const applicationForm = {
  applicationName: 'Test application name',
  audit: {
    created: '2022-01-03T00:00:00.00Z',
    lastPublished: '2022-01-04T00:00:00.00Z',
  },
} as ApplicationFormSummary;

const applicationFormFoundStats = (overrides: any = {}) =>
  merge(
    {
      applicationId: 1,
      inProgressCount: 0,
      submissionCount: 0,
    },
    overrides
  );

const schemeApplicationsData = {
  applicationForm: applicationForm,
  applicationFormStats: applicationFormFoundStats(),
};

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: '12345',
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

const mockScheme: Scheme = {
  name: 'EV Chargepoint Grant',
  schemeId: '12345',
  ggisReference: 'SCH 000003589',
  funderId: 'a068d000004kAlmAAE',
  description:
    'This scheme consists of all the chargepoint Grant for flat owner-occupiers and people living in rented properties is open to Electric Vehicle drivers who live in a flat or rent a property.',
  createdDate: '2022-7-12T17:00:00',
  applicationFormId: 'mock-app-id',
  contactEmail: 'test@gmail.com',
  version: '2',
};

const mockGrantadvertData: getAdvertPublishInformationBySchemeIdResponse = {
  status: 200,
  data: {
    created: '2022-7-12T17:00:00',
    validLastUpdated: true,
    lastUpdatedByEmail: 'my-email',
    grantAdvertId: 'dummy-id',
    grantAdvertStatus: AdvertStatusEnum.DRAFT,
    contentfulSlug: null,
    lastPublishedDate: null,
    lastUpdated: '2022-7-12T17:00:00',
    openingDate: null,
    closingDate: null,
    firstPublishedDate: null,
    lastUnpublishedDate: null,
    unpublishedDate: null,
  },
};

jest.mock('../../../services/SchemeService');
jest.mock('../../../services/SchemeEditorService');
jest.mock('../../../services/ApplicationService');
jest.mock('../../../services/AdvertPageService');

describe('scheme/[schemeId]', () => {
  describe('getServerSideProps', () => {
    const mockedGetScheme = getGrantScheme as jest.MockedFn<
      typeof getGrantScheme
    >;
    const mockedFindApplicationFormFromScheme =
      findApplicationFormFromScheme as jest.MockedFn<
        typeof findApplicationFormFromScheme
      >;
    const mockGetAdvertPublishInformationBySchemeId =
      getGrantAdvertPublishInformationBySchemeId as jest.MockedFn<
        typeof getGrantAdvertPublishInformationBySchemeId
      >;

    it('Should get the scheme id from the path param', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.scheme.schemeId).toStrictEqual('12345');
    });

    it('Should return scheme to view as a prop', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props).toEqual(
        expect.objectContaining({ scheme: mockScheme })
      );
    });

    it('Should return an applicationForm as a prop', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);
      (getApplicationFormSummary as jest.Mock).mockResolvedValue(
        applicationForm
      );

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(
        response.props.schemeApplicationsData.applicationForm
      ).toStrictEqual({
        applicationName: 'Test application name',
        audit: {
          created: '2022-01-03T00:00:00.00Z',
          lastPublished: '2022-01-04T00:00:00.00Z',
        },
      });
    });

    it('Should return the first application form stats as a prop when application is found', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);

      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(
        response.props.schemeApplicationsData.applicationFormStats
      ).toStrictEqual({
        applicationId: 1,
        inProgressCount: 0,
        submissionCount: 0,
      });
    });

    it('Should redirect to service error when error occurs getting scheme details', async () => {
      mockedGetScheme.mockRejectedValue(new AxiosError());

      const response = (await getServerSideProps(
        getContext()
      )) as GetServerSidePropsResult<Redirect>;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve scheme details.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should redirect to service error when error occurs fetching the application ids from the scheme', async () => {
      mockedFindApplicationFormFromScheme.mockRejectedValue({});
      const response = (await getServerSideProps(
        getContext()
      )) as GetServerSidePropsResult<Redirect>;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve scheme details.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should redirect to service error when error occurs fetching an application from the application ids', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});
      const response = (await getServerSideProps(
        getContext()
      )) as GetServerSidePropsResult<Redirect>;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve scheme details.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should return the grantAdvertData as a prop', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);
      mockGetAdvertPublishInformationBySchemeId.mockResolvedValue(
        mockGrantadvertData
      );
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.grantAdvertPublishData).toStrictEqual({
        status: 200,
        data: {
          lastUpdatedByEmail: 'my-email',
          grantAdvertId: 'dummy-id',
          grantAdvertStatus: AdvertStatusEnum.DRAFT,
          contentfulSlug: null,
          created: '2022-7-12T17:00:00',
          lastPublishedDate: null,
          lastUpdated: '2022-7-12T17:00:00',
          openingDate: null,
          closingDate: null,
          firstPublishedDate: null,
          validLastUpdated: true,
          lastUnpublishedDate: null,
          unpublishedDate: null,
        },
      });
    });

    it('Should redirect to service error when error occurs fetching a grant advert status', async () => {
      mockedGetScheme.mockResolvedValue(mockScheme);
      mockedFindApplicationFormFromScheme.mockResolvedValue([
        applicationFormFoundStats(),
      ]);
      mockGetAdvertPublishInformationBySchemeId.mockRejectedValue({});
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to retrieve scheme details.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });
  });

  describe('View Scheme page', () => {
    it('Should render back button', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/dashboard'
      );
    });

    it('Should render a "Grant summary" heading', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByRole('heading', { name: 'Grant summary' });
      const sidebarLink = screen.getByRole('button', {
        name: 'Add or manage editors',
      });
      expect(sidebarLink).toHaveAttribute(
        'href',
        `/scheme/${mockScheme.schemeId}/manage-editors`
      );
    });

    it('Should render a ggis reference number summary list row', () => {
      render(
        <ViewScheme
          isOwner={false}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );

      const sidebarLink = screen.getByRole('button', {
        name: 'View editors',
      });
      expect(sidebarLink).toHaveAttribute(
        'href',
        `/scheme/${mockScheme.schemeId}/view-editors`
      );
      screen.getByText('GGIS Scheme Reference Number');
      screen.getByText('SCH 000003589');
      screen.getByRole('link', { name: 'Change GGIS scheme reference number' });
    });

    it('Should render a support email address summary list row', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByText('Support email address');
      screen.getByText('test@gmail.com');
      screen.getByRole('link', { name: 'Change the support email address' });
    });

    it('Should render the "SchemeApplications" component when there is an application form', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByTestId('scheme-application-component');
    });

    it('Should NOT render the "SchemeApplications" component when there is no application form', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={{
            applicationForm: null,
            applicationFormStats: applicationFormFoundStats(),
          }}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      expect(screen.queryByTestId('scheme-application-component')).toBeFalsy();
    });

    it('Should render the "BuildApplicationForm" component when there is NO application form', () => {
      render(
        <ViewScheme
          scheme={mockScheme}
          schemeApplicationsData={{
            applicationForm: null,
            applicationFormStats: applicationFormFoundStats(),
          }}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByTestId('build-application-form-component');
    });

    it('Should NOT render the "BuildApplicationForm" component when there is an application form', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      expect(
        screen.queryByTestId('build-application-form-component')
      ).toBeFalsy();
    });

    it('Should render Build Advert section when enabledAdBuilder value is set to "enabled"', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'enabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );

      screen.getByTestId('build-advert-component');
    });

    it('Should NOT render Build Advert section when enabledAdBuilder value is set to null (not provided)', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );

      expect(screen.queryByTestId('build-advert-component')).toBeFalsy();
    });

    it('Should render a "Due diligence checks" section for internal applications', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={schemeApplicationsData}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByRole('heading', { name: 'Due diligence checks' });
      screen.getByText(
        /you can download details about your applicants to run due diligence checks\. we gather this information as part of the application form for your grant\./i
      );

      expect(
        screen.getByRole('button', { name: 'Manage due diligence checks' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/${mockScheme.schemeId}/manage-due-diligence-checks`
      );
    });

    it('Should render a "Due diligence checks" section for external applications', () => {
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={null}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      screen.getByRole('heading', { name: 'Due diligence checks' });
      screen.getByText(
        /you can download details about your applicants to run due diligence checks\. we gather this information before applicants start an application form\./i
      );

      expect(
        screen.getByRole('button', { name: 'Manage due diligence checks' })
      ).toHaveAttribute(
        'href',
        `/apply/scheme/${mockScheme.schemeId}/manage-due-diligence-checks`
      );
    });

    it('Should not render a "Due diligence checks" section V1 schemes', () => {
      mockScheme.version = '1';
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={null}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={mockGrantadvertData}
        />
      );
      expect(
        screen.queryByText(/due diligence checks/)
      ).not.toBeInTheDocument();
    });

    it('Should not render a "Due diligence checks" section when no advert and no application', () => {
      mockScheme.version = '2';
      render(
        <ViewScheme
          isOwner={true}
          scheme={mockScheme}
          schemeApplicationsData={null}
          enabledAdBuilder={'disabled'}
          grantAdvertPublishData={{ status: 404 }}
        />
      );
      expect(
        screen.queryByText(/due diligence checks/)
      ).not.toBeInTheDocument();
    });
  });
});
