import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';
import {
  getAdvertStatusBySchemeId,
  getSectionOverviewPageContent,
} from '../../../../../services/AdvertPageService';
import {
  AdvertPage,
  AdvertQuestionStatusEnum,
  AdvertSection,
  GetSectionOverviewPageContentResponse,
} from '../../../../../types/GetSectionOverviewPageContentResponse';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import {
  expectObjectEquals,
  InferServiceMethodResponse,
  mockServiceMethod,
} from '../../../../../testUtils/unitTestHelpers';
import SectionOverview, { getServerSideProps } from './section-overview.page';

jest.mock('../../../../../services/AdvertPageService');

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: 'schemeId',
        advertId: 'advertId',
      },
      query: {},
      req: {
        cookies: { 'gap-test': 'testSessionId' },
      },
    },
    overrides
  );

const mockedPage1: AdvertPage = {
  id: 'pageId1',
  title: 'pageTitle1',
  questions: [],
  status: AdvertQuestionStatusEnum.NOT_STARTED,
};
const mockedPage2: AdvertPage = {
  id: 'pageId2',
  title: 'pageTitle2',
  questions: [],
  status: AdvertQuestionStatusEnum.NOT_STARTED,
};
const mockedPage3: AdvertPage = {
  id: 'pageId3',
  title: 'pageTitle3',
  questions: [],
  status: AdvertQuestionStatusEnum.NOT_STARTED,
};
const mockedPagesForSection1: AdvertPage[] = [mockedPage1, mockedPage2];
const mockedPagesForSection2: AdvertPage[] = [mockedPage3];
const mockedSection1: AdvertSection = {
  id: 'sectionId1',
  title: 'sectionTitle1',
  status: AdvertQuestionStatusEnum.NOT_STARTED,
  pages: mockedPagesForSection1,
};
const mockedSection2: AdvertSection = {
  id: 'sectionId2',
  title: 'sectionTitle2',
  status: AdvertQuestionStatusEnum.NOT_STARTED,
  pages: mockedPagesForSection2,
};
const mockedGetSectionOverviewPageContentResponse: GetSectionOverviewPageContentResponse =
  {
    isPublishDisabled: true,
    grantSchemeName: 'Test Grant Scheme',
    advertName: 'TestAdvertName',
    sections: [mockedSection1, mockedSection2],
  };

const expectedGetServerSideRedirection = {
  redirect: {
    destination: '/error-page/code/GRANT_ADVERT_NOT_FOUND?href=/scheme-list',
    statusCode: 302,
  },
};

const expectedGetServerSideRedirectionToSummaryPage = {
  redirect: {
    destination: '/scheme/schemeId/advert/advertId/summary',
    statusCode: 302,
  },
};

const getProps = (overrides: any = {}) =>
  merge(
    {
      isPublishDisabled: true,
      grantSchemeName: 'Test Grant Scheme',
      sections: [mockedSection1, mockedSection2],
      schemeId: 'schemeId',
      advertId: 'advertId',
      advertName: 'TestAdvertName',
      grantAdvertData: getDefaultGrantAdvertData(),
      recentlyUnpublished: null,
      csrfToken: '',
    },
    overrides
  );

const getDefaultGrantAdvertData = (): InferServiceMethodResponse<
  typeof getAdvertStatusBySchemeId
> => ({
  status: 200,
  data: {
    grantAdvertId: 'testAdvertId',
    grantAdvertStatus: AdvertStatusEnum.DRAFT,
    contentfulSlug: 'test-slug',
  },
});

const axiosError = {
  response: {
    data: {
      code: 'GRANT_ADVERT_NOT_FOUND',
    },
  },
};

describe('section-overview', () => {
  describe('getServerSideProps', () => {
    const mockedGetSectionOverviewPageContent =
      getSectionOverviewPageContent as jest.MockedFn<
        typeof getSectionOverviewPageContent
      >;

    const mockedGetAdvertStatusBySchemeId =
      getAdvertStatusBySchemeId as jest.MockedFn<
        typeof getAdvertStatusBySchemeId
      >;

    it('Should get the expected props__no Csrf Token', async () => {
      mockedGetSectionOverviewPageContent.mockResolvedValue(
        mockedGetSectionOverviewPageContentResponse
      );
      mockedGetAdvertStatusBySchemeId.mockResolvedValue(
        getDefaultGrantAdvertData()
      );

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props).toStrictEqual(getProps());
    });

    it('Should get the expected props__with Csrf Token and recentlyUnpublished', async () => {
      mockedGetSectionOverviewPageContent.mockResolvedValue(
        mockedGetSectionOverviewPageContentResponse
      );
      mockedGetAdvertStatusBySchemeId.mockResolvedValue(
        getDefaultGrantAdvertData()
      );

      const result = (await getServerSideProps(
        getContext({
          req: { csrfToken: () => 'testCSRFToken' },
          query: { recentlyUnpublished: 'true' },
        })
      )) as NextGetServerSidePropsResponse;

      expect(result.props).toStrictEqual(
        getProps({ csrfToken: 'testCSRFToken', recentlyUnpublished: 'true' })
      );
    });

    it('Should redirect to service error when error occurs getting the page content', async () => {
      mockedGetSectionOverviewPageContent.mockRejectedValue(axiosError);
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedGetServerSideRedirection);
    });

    it('Should redirect to service error when error occurs getting grant advert data', async () => {
      (getSectionOverviewPageContent as jest.Mock).mockResolvedValue({});
      (getAdvertStatusBySchemeId as jest.Mock).mockRejectedValue(axiosError);

      const value = await getServerSideProps(getContext());

      expect(value).toStrictEqual(expectedGetServerSideRedirection);
    });

    it('Should redirect to service error when error occurs getting the page content __ no errorCode', async () => {
      mockedGetSectionOverviewPageContent.mockRejectedValue(axiosError);
      const value = await getServerSideProps(getContext());

      expect(value).toStrictEqual(expectedGetServerSideRedirection);
    });

    it('Should redirect to "Summary" page when grant is published', async () => {
      mockedGetSectionOverviewPageContent.mockResolvedValue(
        mockedGetSectionOverviewPageContentResponse
      );
      mockServiceMethod(
        mockedGetAdvertStatusBySchemeId,
        getDefaultGrantAdvertData,
        { data: { grantAdvertStatus: AdvertStatusEnum.PUBLISHED } }
      );
      const result = await getServerSideProps(getContext());

      expectObjectEquals(result, expectedGetServerSideRedirectionToSummaryPage);
    });

    it('Should redirect to "Summary" page when grant is scheduled', async () => {
      mockedGetSectionOverviewPageContent.mockResolvedValue(
        mockedGetSectionOverviewPageContentResponse
      );
      mockServiceMethod(
        mockedGetAdvertStatusBySchemeId,
        getDefaultGrantAdvertData,
        { data: { grantAdvertStatus: AdvertStatusEnum.PUBLISHED } }
      );
      const result = await getServerSideProps(getContext());

      expectObjectEquals(result, expectedGetServerSideRedirectionToSummaryPage);
    });
  });

  describe('Section Overview page (UI render)', () => {
    it('Should render back button', () => {
      render(<SectionOverview {...getProps()} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/scheme/schemeId'
      );
    });

    it('Should render back button', () => {
      render(<SectionOverview {...getProps()} />);
      const backButton = screen.getByRole('link', { name: 'Back' });
      expect(backButton).toHaveAttribute('href', '/apply/scheme/schemeId');
    });

    it('Should render a "Create an advert" heading', () => {
      render(<SectionOverview {...getProps()} />);
      screen.getByRole('heading', { name: 'Create an advert' });
    });

    it('Should render a the text and bullet point after the heading', () => {
      render(<SectionOverview {...getProps()} />);
      const findAGrantLink = screen.getByRole('link', {
        name: /find a grant/i,
      });
      screen.getByText(/how to create an advert:/i);
      screen.getByText(/you must complete each section below/i);
      screen.getByText(
        /once all sections are complete you can publish your advert/i
      );
      screen.getByText(/you can save your progress and come back later/i);
      screen.getByText(/this advert will be published on \./i);
      expect(findAGrantLink).toHaveAttribute(
        'href',
        'https://www.find-government-grants.service.gov.uk'
      );
    });

    it('Should render the task list headings', () => {
      render(<SectionOverview {...getProps()} />);
      screen.getByRole('heading', {
        name: 'sectionTitle1',
      });
      screen.getByRole('heading', {
        name: 'sectionTitle2',
      });
    });

    it('Should render the task list sub list headings', () => {
      render(<SectionOverview {...getProps()} />);
      screen.getByRole('link', {
        name: 'pageTitle1',
      });
      screen.getByRole('link', {
        name: 'pageTitle2',
      });
      screen.getByRole('link', {
        name: 'pageTitle3',
      });
    });

    // TO DO: Recently unpublished checks

    describe('Advert action section', () => {
      it('Should render the Exit link and have the right href', () => {
        render(<SectionOverview {...getProps()} />);
        const exitLink = screen.getByRole('link', {
          name: /Go back to view Scheme page/i,
        });
        expect(exitLink).toHaveAttribute('href', '/apply/scheme/schemeId');
      });

      describe('Advert status is "DRAFT"', () => {
        it('Should render the heading and body for the text after the table', () => {
          render(<SectionOverview {...getProps()} />);

          screen.getByRole('heading', {
            name: 'Publish your advert',
          });
          screen.getByText(
            'If you have finished creating your advert, you can publish it on Find a grant.'
          );
          screen.getByText(
            'You will be able to check your advert again before it is published.'
          );
        });

        it('Should render "Unpublish this advert" button with correct link', () => {
          render(
            <SectionOverview {...getProps({ isPublishDisabled: false })} />
          );

          const publishButton = screen.getByRole('button', {
            name: 'Review and publish',
          });

          expect(publishButton).toHaveAttribute(
            'href',
            '/apply/scheme/schemeId/advert/advertId/summary'
          );
        });

        it('Should render a success notification banner when trigger parameter is available', () => {
          render(
            <SectionOverview {...getProps({ recentlyUnpublished: 'true' })} />
          );

          screen.getByRole('heading', { name: 'Success' });
          screen.getByRole('heading', {
            name: 'Your advert has been unpublished',
          });
          screen.getByText('Your advert does not appear on Find a grant.');
        });
      });

      describe('Advert status is "UNSCHEDULED"', () => {
        it('Should render the heading and body for the text after the table', () => {
          render(
            <SectionOverview
              {...getProps({
                grantAdvertData: {
                  data: {
                    grantAdvertStatus: 'UNSCHEDULED',
                  },
                },
              })}
            />
          );
          screen.getByRole('heading', {
            level: 2,
            name: 'Review and publish your advert',
          });
          screen.getByText(
            'You need to review and publish your advert, even if you have not made any changes.'
          );
          screen.getByText(
            'If you do not it will not be added to Find a grant, or scheduled to be added on the opening date.'
          );
        });

        it('Should render "Review and publish" button with correct link', () => {
          render(
            <SectionOverview
              {...getProps({
                isPublishDisabled: false,
                grantAdvertData: {
                  data: {
                    grantAdvertStatus: 'UNSCHEDULED',
                  },
                },
              })}
            />
          );
          const publishButton = screen.getByRole('button', {
            name: 'Review and publish',
          });

          expect(publishButton).toHaveAttribute(
            'href',
            '/apply/scheme/schemeId/advert/advertId/summary'
          );
        });

        it('Should render a disabled "Review and publish" button when isPublishedDisabled prop is true', () => {
          render(
            <SectionOverview
              {...getProps({
                grantAdvertData: {
                  data: {
                    grantAdvertStatus: 'UNSCHEDULED',
                  },
                },
              })}
            />
          );

          const publishButton = screen.getByRole('button', {
            name: 'Review and publish',
          });

          expect(publishButton).toHaveAttribute('disabled');
          expect(publishButton).not.toHaveAttribute('href');
        });

        it('Should render an importnant notification banner when the status is UNSCHEDULED', () => {
          render(
            <SectionOverview
              {...getProps({
                grantAdvertData: {
                  data: {
                    grantAdvertStatus: 'UNSCHEDULED',
                  },
                },
              })}
            />
          );
          screen.getByRole('heading', { name: 'Important', level: 2 });
          screen.getByText(
            'You need to review and publish your advert again, even if you do not make any changes.'
          );
        });
      });
    });
  });
});
