import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  InferServiceMethodResponse,
  Optional,
  expectObjectEquals,
  getContext,
  mockServiceMethod,
} from 'gap-web-ui';
import { GetServerSidePropsContext } from 'next';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
import {
  getApplicationFormSummary,
  getApplicationStatus,
  handleQuestionOrdering,
} from '../../../../../services/ApplicationService';
import { getPageProps } from '../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../types/InferProps';
import { parseBody } from '../../../../../utils/parseBody';
import { getSessionIdFromCookies } from '../../../../../utils/session';
import EditSectionPage, { getServerSideProps } from '../index.page';

jest.mock('../../../../../services/ApplicationService');
jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../utils/session');

const mockedGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);
const mockedHandleQuestionOrdering = jest.mocked(handleQuestionOrdering);
const mockedGetApplicationStatus = jest.mocked(getApplicationStatus);

const getDefaultAppFormSummary = (): InferServiceMethodResponse<
  typeof getApplicationFormSummary
> => ({
  applicationName: 'Some application name',
  applicationStatus: 'DRAFT',
  audit: {
    created: '2021-08-09T14:00:00.000Z',
    createdBy: 'some-user',
    lastPublished: '2021-08-09T14:00:00.000Z',
    lastUpdateBy: 'some-user',
    lastUpdated: '2021-08-09T14:00:00.000Z',
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
  csrfToken: 'some-csrf-token',
  scrollPosition: 0,
  resolvedUrl: '/apply/build-application/some-application-id/testSectionId',
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
        optional: 'false',
      },
    ],
  },
  version: 1,
});

describe('Edit section page', () => {
  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        applicationId: 'testApplicationId',
        sectionId: 'testSectionId',
      },
      query: {
        scrollPosition: '0',
      },
    });

    beforeEach(() => {
      mockServiceMethod(
        mockedGetApplicationFormSummary,
        getDefaultAppFormSummary
      );
    });

    describe('getServerSideProps "POST" context', () => {
      beforeEach(() => {
        mockedHandleQuestionOrdering.mockResolvedValue(undefined);
        (parseBody as jest.Mock).mockResolvedValue({
          version: 1,
          'Up/testQuestionId': '',
        });
      });

      it('Should call handleQuestionOrdering with correct params', async () => {
        (getSessionIdFromCookies as jest.Mock).mockReturnValue('testSessionId');
        await getServerSideProps(
          getContext(getDefaultContext, {
            req: {
              method: 'POST',
            },
          })
        );

        expect(mockedHandleQuestionOrdering).toHaveBeenCalledWith({
          sessionId: 'testSessionId',
          applicationId: 'testApplicationId',
          sectionId: 'testSectionId',
          questionId: 'testQuestionId',
          increment: -1,
          version: 1,
        });
      });

      it('Should redirect to this page', async () => {
        const result = await getServerSideProps(
          getContext(getDefaultContext, {
            req: {
              method: 'POST',
            },
          })
        );

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/build-application/testApplicationId/testSectionId?scrollPosition=0',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to service error page if something goes wrong', async () => {
        mockedHandleQuestionOrdering.mockRejectedValue(new Error('error'));

        const result = await getServerSideProps(
          getContext(getDefaultContext, {
            req: {
              method: 'POST',
            },
          })
        );

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update section order.","linkAttributes":{"href":"/build-application/testApplicationId/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });

    describe('getServerSideProps "GET" context', () => {
      it('Should call getApplicationStatus with correct params', async () => {
        (getSessionIdFromCookies as jest.Mock).mockReturnValue('testSessionId');
        await getServerSideProps(getContext(getDefaultContext));

        expect(mockedGetApplicationStatus).toHaveBeenCalledWith(
          'testApplicationId',
          'testSessionId'
        );
      });

      it('Should call getApplicationFormSummary with correct params', async () => {
        (getSessionIdFromCookies as jest.Mock).mockReturnValue('testSessionId');
        await getServerSideProps(getContext(getDefaultContext));

        expect(mockedGetApplicationFormSummary).toHaveBeenCalledWith(
          'testApplicationId',
          'testSessionId'
        );
      });

      it('Should return props with correct values', async () => {
        const result = await getServerSideProps(getContext(getDefaultContext));

        expectObjectEquals(result, {
          props: {
            applicationId: 'testApplicationId',
            grantApplicationName: 'Some application name',
            csrfToken: 'some-csrf-token',
            resolvedUrl: '/apply/admin/testResolvedURL',
            scrollPosition: 0,
            section: {
              sectionId: 'testSectionId',
              sectionStatus: 'COMPLETE',
              sectionTitle: 'some-section-title',
              questions: [],
            },
            version: 1,
          },
        });
      });

      it('Should redirect to build application dashboard if application has PUBLISHED status', async () => {
        (getApplicationStatus as jest.Mock).mockReturnValue('PUBLISHED');

        const result = await getServerSideProps(
          getContext(() => ({
            params: {
              applicationId: 'testApplicationId',
              sectionId: 'testSectionId',
            },
            query: {
              scrollPosition: '0',
            },
          }))
        );

        expectObjectEquals(result, {
          redirect: {
            destination: '/build-application/testApplicationId/dashboard',
            permanent: false,
          },
        });
      });

      it('Should redirect to build application dashboard if sectionId is ELIGIBILITY', async () => {
        const result = await getServerSideProps(
          getContext(() => ({
            params: {
              applicationId: 'testApplicationId',
              sectionId: 'ELIGIBILITY',
            },
            query: {
              scrollPosition: '0',
            },
          }))
        );

        expectObjectEquals(result, {
          redirect: {
            destination: '/build-application/testApplicationId/dashboard',
            permanent: false,
          },
        });
      });

      it('Should redirect to build application dashboard if sectionId is ESSENTIAL', async () => {
        const result = await getServerSideProps(
          getContext(() => ({
            params: {
              applicationId: 'testApplicationId',
              sectionId: 'ESSENTIAL',
            },
            query: {
              scrollPosition: '0',
            },
          }))
        );

        expectObjectEquals(result, {
          redirect: {
            destination: '/build-application/testApplicationId/dashboard',
            permanent: false,
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
            query: {
              scrollPosition: '0',
            },
          }))
        );

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to edit a section","linkAttributes":{"href":"/dashboard","linkText":"Please find your scheme application form and continue.","linkInformation":"Your previous progress has been saved."}}',
            permanent: false,
          },
        });
      });

      it('Should redirect to service error page if something goes wrong', async () => {
        mockedGetApplicationFormSummary.mockRejectedValueOnce(
          new Error('error')
        );

        const result = await getServerSideProps(getContext(getDefaultContext));

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to edit a section","linkAttributes":{"href":"/dashboard","linkText":"Please find your scheme application form and continue.","linkInformation":"Your previous progress has been saved."}}',
            permanent: false,
          },
        });
      });
    });
  });

  describe('Edit Section Page', () => {
    it('Should render a meta title', () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      expect(document.title).toBe('Build an application form - Manage a grant');
    });

    it("Should render 'Back' button", () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/build-application/some-application-id/dashboard'
      );
    });

    it('Should render title of the page', () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      screen.getByText('Edit this section');
    });

    it('Should render the section title', () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      screen.getByText('some-section-title');
    });

    it('Should render a question', () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
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
        '/apply/build-application/some-application-id/testSectionId/delete-confirmation?version=1',
      ],
      [
        'Save and go back',
        '/apply/build-application/some-application-id/dashboard',
      ],
    ])('button %s should have href %s', (name, href) => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      expect(screen.getByRole('button', { name })).toHaveAttribute(
        'href',
        href
      );
    });

    it('Should render up and down buttons', () => {
      render(<EditSectionPage {...getPageProps(getDefaultProps)} />);
      expect(
        screen.getByRole('button', {
          name: 'Move question some-question-title up',
        })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', {
          name: 'Move question some-question-title down',
        })
      ).toBeDisabled();
    });

    it.each([
      { name: 'Move question some-question-title up', disabled: true },
      { name: 'Move question some-question-title down', disabled: false },
      { name: 'Move question some-question-title-1 up', disabled: false },
      { name: 'Move question some-question-title-1 down', disabled: false },
      { name: 'Move question some-question-title-2 up', disabled: false },
      { name: 'Move question some-question-title-2 down', disabled: true },
    ])('Should render up and down buttons', ({ name, disabled }) => {
      render(
        <EditSectionPage
          {...getPageProps(getDefaultProps, {
            section: {
              ...getDefaultProps().section,
              questions: [
                ...getDefaultProps().section.questions!,
                {
                  questionId: 'testQuestionId2',
                  fieldTitle: 'some-question-title-1',
                  responseType: ResponseTypeEnum.LongAnswer,
                  adminSummary: '',
                  displayText: '',
                  fieldPrefix: '',
                  hintText: '',
                  profileField: '',
                  questionSuffix: '',
                  validation: {},
                },
                {
                  questionId: 'testQuestionId3',
                  fieldTitle: 'some-question-title-2',
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
          })}
        />
      );

      const button = screen.getByRole('button', { name });
      if (disabled) {
        expect(button).toBeDisabled();
      } else {
        expect(button).not.toBeDisabled();
      }
    });
  });
});
