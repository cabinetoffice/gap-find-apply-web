import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  Redirect,
} from 'next';
import {
  ApplicationFormSection,
  ApplicationFormSummary,
} from '../../../types/ApplicationForm';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import ServiceError from '../../../types/ServiceError';
import Dashboard, { getServerSideProps } from './dashboard.page';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { merge } from 'lodash';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('../../../services/ApplicationService');
const mockedGetApplicationFormSummary =
  getApplicationFormSummary as jest.MockedFn<typeof getApplicationFormSummary>;

describe('Dashboard', () => {
  describe('Dashboard page', () => {
    const mockDashboardParams = {
      sections: [
        {
          sectionId: 'ELIGIBILITY',
          sectionTitle: 'Eligibility',
          sectionStatus: 'INCOMPLETE',
          questions: [
            {
              questionId: 'testEligibilityQuestionId',
              fieldTitle: 'Eligibility statement',
            },
          ],
        },
        {
          sectionId: 'ESSENTIAL',
          sectionTitle: 'Required checks',
          sectionStatus: 'IN PROGRESS',
          questions: [
            {
              questionId: '1',
              fieldTitle: 'Sample question 1',
            },
            {
              questionId: '2',
              fieldTitle: 'Sample question 2',
            },
            {
              questionId: '3',
              fieldTitle: 'Sample question 3',
            },
          ],
        },
        {
          sectionId: 'testCustomSectionId',
          sectionTitle: 'Custom section',
          questions: [
            {
              questionId: 'testCustomQuestionId',
              fieldTitle: 'Custom question',
              responseType: 'MultipleSelection',
            },
          ],
        },
      ] as ApplicationFormSection[],
      grantApplicationName: 'Industrial Energy Transformation Fund (IETF)',
      applicationId: '87654321',
      grantSchemeId: '12345678',
      applicationStatus: 'DRAFT' as ApplicationFormSummary['applicationStatus'],
      recentlyUnpublished: false,
    };
    const component = <Dashboard {...mockDashboardParams} />;

    it('Should render a back button', () => {
      render(component);
      screen.getByRole('link', { name: 'Back' });
    });

    it('Should render the application name & page title', () => {
      render(component);
      screen.getByText('Industrial Energy Transformation Fund (IETF)');
      screen.getByRole('heading', { name: 'Build an application form' });
    });

    it('Should render a table for each section', () => {
      render(component);
      expect(screen.getAllByTestId('table-caption').length).toStrictEqual(3);
    });

    it('Should render a publish application button when the application status is NOT "PUBLISHED"', () => {
      render(component);
      screen.getByRole('button', { name: 'Publish' });
    });

    it('Should render an enabled publish button when the application status is NOT "PUBLISHED" and the required sections are complete', () => {
      const { sections, ...rest } = mockDashboardParams;
      sections[0].sectionStatus = 'COMPLETE';
      sections[1].sectionStatus = 'COMPLETE';
      render(<Dashboard {...rest} sections={sections} />);
      expect(
        screen.getByRole('button', { name: 'Publish' })
      ).not.toHaveAttribute('disabled');
    });

    it('Should render a disabled publish button when the application status is NOT "PUBLISHED" and the required sections are NOT complete', () => {
      const { sections, ...rest } = mockDashboardParams;
      sections[0].sectionStatus = 'INCOMPLETE';
      sections[1].sectionStatus = 'INCOMPLETE';
      render(<Dashboard {...rest} sections={sections} />);
      expect(screen.getByRole('button', { name: 'Publish' })).toHaveAttribute(
        'disabled'
      );
    });

    it('Should render a disabled publish button when the application status is NOT "PUBLISHED" and a custom section has no questions', () => {
      const { sections, ...rest } = mockDashboardParams;
      sections[0].sectionStatus = 'COMPLETE';
      sections[1].sectionStatus = 'COMPLETE';
      sections[2].questions = [];
      render(<Dashboard {...rest} sections={sections} />);
      expect(screen.getByRole('button', { name: 'Publish' })).toHaveAttribute(
        'disabled'
      );
    });

    it('Should render an unpublish application button when the application status is "PUBLISHED"', () => {
      render(
        <Dashboard {...mockDashboardParams} applicationStatus="PUBLISHED" />
      );
      screen.getByRole('button', { name: 'Unpublish' });
    });

    it('Should render an unpublished banner when recentlyUnpublished is true', () => {
      render(<Dashboard {...mockDashboardParams} recentlyUnpublished={true} />);
      screen.getByRole('heading', {
        name: 'Grant application form unpublished',
      });
    });

    it('Should NOT render an unpublished banner when recentlyUnpublished is null', () => {
      render(<Dashboard {...mockDashboardParams} />);
      expect(
        screen.queryByRole('heading', {
          name: 'Grant application form unpublished',
        })
      ).toBeFalsy();
    });
  });

  describe('getServerSideProps', () => {
    const serviceErrorPageParams: ServiceError = {
      errorInformation:
        'Something went wrong while trying to create an application',
      linkAttributes: {
        href: `/scheme-list`,
        linkText: 'Please find your scheme application form and continue.',
        linkInformation: 'Your previous progress has been saved.',
      },
    };

    const redirectResponse = {
      redirect: {
        destination: `/service-error?serviceErrorProps=${JSON.stringify(
          serviceErrorPageParams
        )}`,
        permanent: false,
      },
    };

    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            applicationId: 'applicationId',
          } as Record<string, string>,
          query: {
            recentlyUnpublished: '',
          } as Record<string, string>,
          req: {
            cookies: { 'gap-test': 'testSessionId' },
          } as any,
        } as GetServerSidePropsContext,
        overrides
      );

    const sections = [
      {
        sectionId: '1',
        sectionTitle: 'Eligibility',
        sectionStatus: 'INCOMPLETE',
      },
      {
        sectionId: '2',
        sectionTitle: 'Essential Information',
        sectionStatus: 'INCOMPLETE',
      },
    ] as ApplicationFormSection[];

    beforeEach(() => {
      mockedGetApplicationFormSummary.mockResolvedValue({
        grantApplicationId: '54321',
        grantSchemeId: '12345',
        applicationName: 'Industrial Energy Transformation Fund (IETF)',
        applicationStatus: 'DRAFT',
        audit: {
          version: 1,
          createdDate: 'createdDate',
          lastUpdatedDate: 'lastUpdatedDate',
          lastUpdatedBy: 'lastUpdatedBy',
        },
        sections: sections,
      });

      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

    it('Redirects to an error page when fetching the application form summary throws an error', async () => {
      mockedGetApplicationFormSummary.mockRejectedValueOnce({});

      const response = (await getServerSideProps(
        getContext()
      )) as GetServerSidePropsResult<Redirect>;

      expect(response).toStrictEqual(redirectResponse);
    });

    it('Returns the application name when the grantSchemeId AND applicationId exist', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.grantApplicationName).toStrictEqual(
        'Industrial Energy Transformation Fund (IETF)'
      );
    });

    it('Returns the application id when the grantSchemeId AND applicationId exist', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.applicationId).toStrictEqual('54321');
    });

    it('Returns the scheme id when the grantSchemeId AND applicationId exist', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.grantSchemeId).toStrictEqual('12345');
    });

    it('Returns a list of sections when the grantSchemeId AND applicationId exist', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.sections).toStrictEqual(sections);
    });

    it('Returns an application status', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.applicationStatus).toStrictEqual('DRAFT');
    });

    it('Returns false for recentlyUnpublished when the query param is empty', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.recentlyUnpublished).toStrictEqual(false);
    });

    it('Returns true for recentlyUnpublished when the query param is NOT empty', async () => {
      const response = (await getServerSideProps(
        getContext({ query: { recentlyUnpublished: 'anything' } })
      )) as NextGetServerSidePropsResponse;

      expect(response.props.recentlyUnpublished).toStrictEqual(true);
    });
  });
});
