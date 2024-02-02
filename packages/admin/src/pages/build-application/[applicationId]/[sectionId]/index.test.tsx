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
import ResponseTypeEnum from '../../../../enums/ResponseType';

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
    questions: [
      {
        questionId: 'testQuestionId',
        fieldTitle: 'some-question-title',
        responseType: ResponseTypeEnum.LongAnswer,
        adminSummary: '',
        displayText: '',
        fieldPrefix: '',
        hintText: '',
        profileField: '',
        questionSuffix: '',
        validation: {},
      },
    ],
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

    beforeEach(() => {
      mockServiceMethod(
        mockedGetApplicationFormSummary,
        getDefaultAppFormSummary
      );
    });

    it('Should call getApplicationFormSummary with correct params', async () => {
      await getServerSideProps(getContext(getDefaultContext));

      expect(mockedGetApplicationFormSummary).toHaveBeenCalledWith(
        'testApplicationId',
        ''
      );
    });

    it('Should return props with correct values', async () => {
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        props: {
          applicationId: 'testApplicationId',
          grantApplicationName: 'Some application name',
          section: {
            sectionId: 'testSectionId',
            sectionStatus: 'COMPLETE',
            sectionTitle: 'some-section-title',
            questions: [],
          },
        },
      });
    });

    it('Should redirect to service error page if section is not found', async () => {
      const result = await getServerSideProps(
        getContext(() => ({
          params: {
            applicationId: 'testApplicationId',
            sectionId: 'non-existent-section-id',
          },
        }))
      );

      expectObjectEquals(result, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to edit a section","linkAttributes":{"href":"/scheme-list","linkText":"Please find your scheme application form and continue.","linkInformation":"Your previous progress has been saved."}}',
          permanent: false,
        },
      });
    });

    it('Should redirect to service error page if something goes wrong', async () => {
      mockedGetApplicationFormSummary.mockRejectedValueOnce(new Error('error'));

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          destination:
            '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to edit a section","linkAttributes":{"href":"/scheme-list","linkText":"Please find your scheme application form and continue.","linkInformation":"Your previous progress has been saved."}}',
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

    it("Should render 'Back' button", () => {
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/build-application/some-application-id/dashboard'
      );
    });

    it('Should render title of the page', () => {
      screen.getByText('Edit this section');
    });

    it('Should render the section title', () => {
      screen.getByText('some-section-title');
    });

    it('Should render a question', () => {
      screen.getByText('some-question-title');
      screen.getByText('Long answer');
      expect(screen.getAllByRole('link', { name: 'Edit' })).toHaveLength(2);
    });

    it.each([
      [
        'Add a new question',
        '/apply/build-application/some-application-id/testSectionId/question-content',
      ],
      [
        'Delete section',
        '/apply/build-application/some-application-id/testSectionId/delete-confirmation',
      ],
      [
        'Save and go back',
        '/apply/build-application/some-application-id/dashboard',
      ],
    ])('button %s should have href %s', (name, href) => {
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'href',
        href
      );
    });
  });
});
