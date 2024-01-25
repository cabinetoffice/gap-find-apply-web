import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  InferServiceMethodResponse,
  Optional,
  expectObjectEquals,
  getContext,
  mockServiceMethod,
} from 'gap-web-ui';
import InferProps from '../../../../types/InferProps';
import { getApplicationFormSummary } from '../../../../services/ApplicationService';
import EditSectionPage, { getServerSideProps } from './index.page';
import { GetServerSidePropsContext } from 'next';
import { getPageProps } from '../../../../testUtils/unitTestHelpers';

jest.mock('../../../../services/ApplicationService');

const mockedGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);

const getDefaultAppFormSummary = (): InferServiceMethodResponse<
  typeof getApplicationFormSummary
> => ({
  applicationName: 'Some application name',
  applicationStatus: 'DRAFT',
  audit: {
    created: '2021-08-09T14:00:00.000Z',
    lastPublished: '2021-08-09T14:00:00.000Z',
    lastUpdatedBy: 'some-user',
    lastUpdatedDate: '2021-08-09T14:00:00.000Z',
    version: 1,
  },
  grantApplicationId: 'testApplicationId',
  grantSchemeId: 'some-grant-scheme-id',
  sections: [
    {
      sectionId: 'testSectionId',
      sectionStatus: 'COMPLETE',
      sectionTitle: 'some-section-title',
      questions: [],
    },
  ],
});

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  applicationId: 'some-application-id',
  grantApplicationName: 'some-grant-application-name',
  section: {
    sectionId: 'testSectionId',
    sectionStatus: 'COMPLETE',
    sectionTitle: 'some-section-title',
    questions: [],
  },
});

describe('Edit section page', () => {
  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        applicationId: 'testApplicationId',
        sectionId: 'testSectionId',
      },
    });

    it('Should call getApplicationFormSummary with correct params', async () => {
      mockServiceMethod(
        mockedGetApplicationFormSummary,
        getDefaultAppFormSummary
      );

      await getServerSideProps(getContext(getDefaultContext));

      expect(mockedGetApplicationFormSummary).toHaveBeenCalledWith(
        'testApplicationId',
        ''
      );
    });

    it('Should return props with correct values', async () => {
      mockServiceMethod(
        mockedGetApplicationFormSummary,
        getDefaultAppFormSummary
      );

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result.props!, {
        applicationId: 'testApplicationId',
        grantApplicationName: 'Some application name',
        section: {
          sectionId: 'testSectionId',
          sectionStatus: 'COMPLETE',
          sectionTitle: 'some-section-title',
          questions: [],
        },
      });
    });

    it('Should redirect to service error page if something goes wrong', async () => {
      mockedGetApplicationFormSummary.mockRejectedValueOnce(new Error('error'));

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          destination: `/service-error?serviceErrorProps=${JSON.stringify({
            errorInformation:
              'Something went wrong while trying to edit a section',
            linkAttributes: {
              href: `/scheme-list`,
              linkText:
                'Please find your scheme application form and continue.',
              linkInformation: 'Your previous progress has been saved.',
            },
          })}`,
          permanent: false,
        },
      });
    });
  });

  describe('Edit Section Page', () => {
    beforeEach(() => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
    });

    it('Should render a meta title', () => {
      expect(document.title).toBe('Build an application form - Manage a grant');
    });

    it('Should render title of the page', () => {
      screen.getByText('Edit this section');
    });

    it("Should render 'Back' button", () => {
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/build-application/some-application-id/dashboard'
      );
    });
  });
});
