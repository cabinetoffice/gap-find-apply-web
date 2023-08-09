import '@testing-library/jest-dom';
import { merge, cloneDeep } from 'lodash';
import { render, screen } from '@testing-library/react';
import * as sessionUtils from '../../../../../../utils/session';
import * as AdvertPageService from '../../../../../../services/AdvertPageService';
import * as serviceErrorHelpers from '../../../../../../utils/serviceErrorHelpers';
import AdvertSummaryPage, { getServerSideProps } from './summary';
import { Redirect } from 'next';

import {
  sessionCookie,
  summaryPageResponse,
  advertName,
  axiosError,
  dummyDraftGrantAdvertDataWithAdvert,
} from './summary.testdata';
import {
  toHaveBeenCalledWith,
  expectObjectEquals,
  getPageProps,
} from '../../../../../../testUtils/unitTestHelpers';
import { parseBody } from 'next/dist/server/api-utils/node';
import InferProps from '../../../../../../types/InferProps';
import AdvertStatusEnum from '../../../../../../enums/AdvertStatus';

jest.mock('../../../../../../utils/session');
jest.mock('../../../../../../services/AdvertPageService');
jest.mock('../../../../../../utils/serviceErrorHelpers');
jest.mock('next/dist/server/api-utils/node');

const mockSessionUtils = jest.mocked(sessionUtils);
const mockAdvertPageService = jest.mocked(AdvertPageService);
const mockServiceErrorHelpers = jest.mocked(serviceErrorHelpers);

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        schemeId: 'schemeId',
        advertId: 'advertId',
      },
      req: {
        cookies: { 'gap-test': 'testSessionId' },
      },
      resolvedUrl: '/resolvedURL',
    },
    overrides
  );

describe('getServerSideProps', () => {
  beforeEach(() => {
    mockSessionUtils.getSessionIdFromCookies.mockReturnValue(sessionCookie);
    mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
      summaryPageResponse
    );
  });

  it('should get without csrf token', async () => {
    const context = getContext();
    const expectedResult: InferProps<typeof getServerSideProps> = {
      advertName,
      sections: summaryPageResponse.sections,
      schemeId: context.params.schemeId,
      futurePublishingDate: false,
      advertId: context.params.advertId,
      resolvedUrl: '/resolvedURL',
      csrfToken: '',
      status: AdvertStatusEnum.DRAFT,
      grantAdvertData: {
        status: 200,
        data: {
          grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
          grantAdvertStatus: AdvertStatusEnum.DRAFT,
          contentfulSlug: 'some-contentful-slug',
        },
      },
    };
    mockAdvertPageService.getAdvertStatusBySchemeId.mockResolvedValue(
      dummyDraftGrantAdvertDataWithAdvert
    );

    const result = await getServerSideProps(context);

    expect(mockSessionUtils.getSessionIdFromCookies).toBeCalledWith(
      context.req
    );
    expect(mockAdvertPageService.getSummaryPageContent).toBeCalledWith(
      sessionCookie,
      context.params.schemeId,
      context.params.advertId
    );
    expect(mockAdvertPageService.getAdvertStatusBySchemeId).toBeCalledWith(
      sessionCookie,
      context.params.schemeId
    );
    expectObjectEquals(result, { props: expectedResult });
  });

  it('should get with csrf token', async () => {
    const csrfToken = 'testCSRFToken';
    const context = getContext({ req: { csrfToken: () => csrfToken } });
    const expectedResult: InferProps<typeof getServerSideProps> = {
      advertName,
      sections: summaryPageResponse.sections,
      schemeId: context.params.schemeId,
      futurePublishingDate: false,
      advertId: context.params.advertId,
      csrfToken,
      resolvedUrl: '/resolvedURL',
      status: AdvertStatusEnum.DRAFT,
      grantAdvertData: {
        status: 200,
        data: {
          grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
          grantAdvertStatus: AdvertStatusEnum.DRAFT,
          contentfulSlug: 'some-contentful-slug',
        },
      },
    };
    mockAdvertPageService.getAdvertStatusBySchemeId.mockResolvedValue(
      dummyDraftGrantAdvertDataWithAdvert
    );

    const result = await getServerSideProps(context);

    expect(mockSessionUtils.getSessionIdFromCookies).toBeCalledWith(
      context.req
    );
    expect(mockAdvertPageService.getSummaryPageContent).toBeCalledWith(
      sessionCookie,
      context.params.schemeId,
      context.params.advertId
    );
    expect(mockAdvertPageService.getAdvertStatusBySchemeId).toBeCalledWith(
      sessionCookie,
      context.params.schemeId
    );
    expectObjectEquals(result, { props: expectedResult });
  });

  it('should redirect if there is an error', async () => {
    mockAdvertPageService.getSummaryPageContent.mockRejectedValue(axiosError);

    const expectedResult = {
      redirect: {
        destination:
          '/error-page/code/GRANT_ADVERT_NOT_FOUND?href=/scheme-list',
        statusCode: 302,
      } as Redirect,
    };
    const mockGenerateErrorPageRedirectForAdvertPages =
      mockServiceErrorHelpers.generateErrorPageRedirectV2.mockReturnValue(
        expectedResult
      );

    const csrfToken = 'testCSRFToken';
    const context = getContext({ req: { csrfToken: () => csrfToken } });

    const result = await getServerSideProps(context);

    expect(mockSessionUtils.getSessionIdFromCookies).toBeCalledWith(
      context.req
    );
    expect(mockAdvertPageService.getSummaryPageContent).toBeCalledWith(
      sessionCookie,
      context.params.schemeId,
      context.params.advertId
    );
    expect(mockGenerateErrorPageRedirectForAdvertPages).toBeCalledWith(
      axiosError.response.data.code,
      '/summary'
    );
    expect(result).toStrictEqual(expectedResult);
  });

  describe('getServerSideProps POST request', () => {
    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({});
    });

    it('Should call schedule advert when the opening date is in the future', async () => {
      // Create a summary page response with a future date
      const summaryPageResponseFuture = cloneDeep(summaryPageResponse);
      summaryPageResponseFuture.sections[2].pages[0].questions[0].multiResponse =
        ['5', '11', (new Date().getFullYear() + 1).toString(), '10', '00'];
      summaryPageResponseFuture.sections[2].pages[0].questions[1].multiResponse =
        ['10', '12', (new Date().getFullYear() + 1).toString(), '18', '00'];
      mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
        summaryPageResponseFuture
      );

      const context = getContext({ req: { method: 'POST' } });

      const response = await getServerSideProps(context);

      toHaveBeenCalledWith(
        mockAdvertPageService.scheduleAdvert,
        1,
        sessionCookie,
        context.params.advertId
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/scheme/schemeId/advert/advertId/schedule-success',
          statusCode: 302,
        },
      });
    });

    it('Should call publish advert when the opening date is in the past', async () => {
      const context = getContext({ req: { method: 'POST' } });

      const response = await getServerSideProps(context);

      toHaveBeenCalledWith(
        mockAdvertPageService.publishAdvert,
        1,
        sessionCookie,
        context.params.advertId
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/scheme/schemeId/advert/advertId/publish-success',
          statusCode: 302,
        },
      });
    });

    it('Should call schedule advert when the opening date is today', async () => {
      // Create a summary page response with todays date
      const today = new Date();
      const summaryPageResponseFuture = cloneDeep(summaryPageResponse);
      summaryPageResponseFuture.sections[2].pages[0].questions[0].multiResponse =
        [
          today.getDate().toString(),
          (today.getMonth() + 1).toString(),
          today.getFullYear().toString(),
          today.getHours().toString(),
          today.getMinutes().toString(),
        ];
      summaryPageResponseFuture.sections[2].pages[0].questions[1].multiResponse =
        [
          today.getDate().toString(),
          (today.getMonth() + 1).toString(),
          today.getFullYear().toString(),
          today.getHours().toString(),
          today.getMinutes().toString(),
        ];
      mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
        summaryPageResponseFuture
      );

      const context = getContext({ req: { method: 'POST' } });

      const response = await getServerSideProps(context);

      toHaveBeenCalledWith(
        mockAdvertPageService.publishAdvert,
        1,
        sessionCookie,
        context.params.advertId
      );

      expectObjectEquals(response, {
        redirect: {
          destination: '/scheme/schemeId/advert/advertId/publish-success',
          statusCode: 302,
        },
      });
    });
  });
});

describe('AdvertSummaryPage', () => {
  const csrfToken = 'testCSRFToken';
  const context = getContext({ req: { csrfToken: () => csrfToken } });

  const getDefaultProps = () =>
    ({
      advertName,
      sections: summaryPageResponse.sections,
      schemeId: context.params.schemeId,
      futurePublishingDate: false,
      advertId: context.params.advertId,
      csrfToken: csrfToken,
      resolvedUrl: '/resolvedURL',
      status: AdvertStatusEnum.DRAFT,
      grantAdvertData: {
        status: 200,
        data: {
          grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
          grantAdvertStatus: AdvertStatusEnum.DRAFT,
          contentfulSlug: null,
        },
      },
    } as InferProps<typeof getServerSideProps>);
  mockAdvertPageService.getAdvertStatusBySchemeId.mockResolvedValue(
    dummyDraftGrantAdvertDataWithAdvert
  );

  it('Should render back button', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${context.params.schemeId}/advert/${context.params.advertId}/section-overview`
    );
  });

  it('Should render the advert name and page heading', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${context.params.schemeId}/advert/${context.params.advertId}/section-overview`
    );
  });

  it('Should render advert name and "Create an advert" heading', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByText(advertName);
    screen.getByRole('heading', { name: 'Review your advert' });
  });

  it('Should render the page description text, status: DRAFT', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByText('Below is a summary of the information you have entered.');
    screen.getByText('You can go back and change anything you need to.');
  });

  it('Should render the page description text, status: UNPUBLISHED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNPUBLISHED,
        })}
      />
    );
    screen.getByText('Below is a summary of the information you have entered.');
    screen.getByText('You can go back and change anything you need to.');
  });

  it('Should render the page description text, status: UNSCHEDULED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.UNSCHEDULED,
        })}
      />
    );
    screen.getByText('Below is a summary of the information you have entered.');
    screen.getByText('You can go back and change anything you need to.');
  });

  it('Should render the page description text, status: PUBLISHED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    screen.getByText('Below is a summary of the information you have entered.');
    expect(
      screen.queryByText('You can go back and change anything you need to.')
    ).toBeFalsy();
  });

  it('Should render "Your grant advert" heading, status: PUBLISHED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    screen.getByRole('heading', { name: 'Your grant advert' });
  });

  it('Should render the page description text, status: SCHEDULED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    screen.getByText('Below is a summary of the information you have entered.');
    expect(
      screen.queryByText('You can go back and change anything you need to.')
    ).toBeFalsy();
  });

  it('Should render "Your grant advert" heading, status: SCHEDULED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    screen.getByRole('heading', { name: 'Your grant advert' });
  });

  it('Should render the grant details section', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByRole('heading', { name: '1. Grant Details' });
    const section = summaryPageResponse.sections[0];

    screen.getByText(section.pages[0].questions[0].title);
    screen.getByText(section.pages[0].questions[0].response as string);

    screen.getByText(section.pages[1].questions[0].title);
    screen.getByText(
      section.pages[1].questions[0].multiResponse?.at(0) as string
    );
    screen.getByText(
      section.pages[1].questions[0].multiResponse?.at(1) as string
    );

    screen.getByText(section.pages[2].questions[0].title);
    screen.getByText(section.pages[2].questions[0].response as string);
    screen.getByText(section.pages[1].questions[0].title);

    screen.getByText(
      section.pages[3].questions[0].multiResponse?.at(0) as string
    );
    screen.getByText(
      section.pages[3].questions[0].multiResponse?.at(1) as string
    );
  });

  it('Should render the Award amounts section', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByRole('heading', { name: '2. Award amounts' });
    const section = summaryPageResponse.sections[1];
    const page = section.pages[0];
    screen.getByText(page.questions[0].title);
    screen.getByText(page.questions[0].response as string);

    screen.getByText(page.questions[1].title);
    screen.getByText(page.questions[1].response as string);

    screen.getByText(page.questions[2].title);
    screen.getByText(page.questions[2].response as string);
  });

  it('Should render the Application dates section', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByRole('heading', { name: '3. Application dates' });
    screen.getByText('Opening date');
    screen.getByText('5 November 2022');
    screen.getByText('Opening time');
    screen.getByText('10:00am');

    screen.getByText('Closing date');
    screen.getByText('10 December 2022');
    screen.getByText('Closing time');
    screen.getByText('18:00pm');
  });

  it('Should render the How to apply section', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByRole('heading', { name: '4. How to apply' });
    screen.getByText("'Start new application' button links to:");
    screen.getByText('https://www.find-government-grants.service.gov.uk/');
  });

  it('Should render the Further information section', () => {
    render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
    screen.getByRole('heading', { name: '5. Further information' });
    screen.getByText('Eligibility information');
    screen.getByText('Heading 1');
    screen.getByText('Heading 2');
    screen.getByText('Heading 3');
    screen.getByText('Heading 4');
    screen.getByText('Heading 5');
    screen.getByText('Heading 6');
  });

  it('Should render an "Unpublish this advert" button when the status is PUBLISHED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );

    screen.getByRole('button', { name: 'Unpublish this advert' });
    expect(
      screen.queryByRole('button', { name: 'Make changes to my advert' })
    ).toBeFalsy();
  });

  it('Should render back button with href to scheme details page when status is PUBLISHED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.PUBLISHED,
        })}
      />
    );
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${context.params.schemeId}`
    );
  });

  it('Should render a "Make changes to my advert" button when the status is SCHEDULED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );

    screen.getByRole('button', { name: 'Make changes to my advert' });
    expect(
      screen.queryByRole('button', { name: 'Unpublish this advert' })
    ).toBeFalsy();
  });
  it('Should render back button with href to scheme details page when status is SCHEDULED', () => {
    render(
      <AdvertSummaryPage
        {...getPageProps(getDefaultProps, {
          status: AdvertStatusEnum.SCHEDULED,
        })}
      />
    );
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${context.params.schemeId}`
    );
  });

  describe('Page footer content', () => {
    it('Should render a publish button, status: DRAFT', () => {
      render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
      screen.getByRole('button', {
        name: `Publish my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Schedule my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a schedule button, status: DRAFT', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, { futurePublishingDate: true })}
        />
      );
      screen.getByRole('button', {
        name: `Schedule my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Publish my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a publish button, status: UNPUBLISHED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.UNPUBLISHED,
          })}
        />
      );
      screen.getByRole('button', {
        name: `Publish my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Schedule my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a schedule button, status: UNPUBLISHED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.UNPUBLISHED,
            futurePublishingDate: true,
          })}
        />
      );
      screen.getByRole('button', {
        name: `Schedule my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Publish my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a publish button, status: UNSCHEDULED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.UNSCHEDULED,
          })}
        />
      );
      screen.getByRole('button', {
        name: `Publish my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Schedule my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a schedule button, status: UNSCHEDULED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.UNSCHEDULED,
            futurePublishingDate: true,
          })}
        />
      );
      screen.getByRole('button', {
        name: `Schedule my advert - ${advertName}`,
      });
      expect(
        screen.queryByRole('button', {
          name: `Publish my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
    });

    it('Should render a page footer, status: PUBLISHED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.PUBLISHED,
          })}
        />
      );
      expect(
        screen.queryByRole('button', {
          name: `Schedule my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(
        screen.queryByRole('button', {
          name: `Publish my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
      expect(
        screen.getAllByRole('link', { name: 'Back to scheme details' })
      ).toHaveLength(1);
    });

    it('Should render a page footer, status: SCHEDULED', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            status: AdvertStatusEnum.SCHEDULED,
          })}
        />
      );
      expect(
        screen.queryByRole('button', {
          name: `Schedule my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(
        screen.queryByRole('button', {
          name: `Publish my advert - ${advertName}`,
        })
      ).toBeFalsy();
      expect(screen.getAllByRole('link', { name: 'Back' })).toHaveLength(1);
      expect(
        screen.getAllByRole('link', { name: 'Back to scheme details' })
      ).toHaveLength(1);
    });
  });

  describe('AdvertSummaryPage status tags', () => {
    const getDefaultProps = () =>
      ({
        advertName,
        sections: summaryPageResponse.sections,
        schemeId: context.params.schemeId as string,
        futurePublishingDate: false,
        advertId: context.params.advertId as string,
        csrfToken: csrfToken as string,
        resolvedUrl: '/resolvedURL',
        status: AdvertStatusEnum.DRAFT,
        grantAdvertData: {
          status: 200,
          data: {
            grantAdvertId: '2476958a-c9ab-447b-8b48-8b34b87dee0c',
            grantAdvertStatus: AdvertStatusEnum.DRAFT,
            contentfulSlug: null,
          },
        },
      } as InferProps<typeof getServerSideProps>);

    it('Should render a PUBLISHED tag if advert is published', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            grantAdvertData: {
              data: { grantAdvertStatus: AdvertStatusEnum.PUBLISHED },
            },
          })}
        />
      );
      const advertStatusTag = screen.getByTestId('advertStatusTag');
      expect(advertStatusTag).toHaveTextContent('PUBLISHED');
    });

    it('Should render a SCHEDULED tag if advert is scheduled', () => {
      render(
        <AdvertSummaryPage
          {...getPageProps(getDefaultProps, {
            grantAdvertData: {
              data: { grantAdvertStatus: AdvertStatusEnum.SCHEDULED },
            },
          })}
        />
      );
      const advertStatusTag = screen.getByTestId('advertStatusTag');
      expect(advertStatusTag).toHaveTextContent('SCHEDULED');
    });

    it('Should render a DRAFT tag if advert is published', () => {
      render(<AdvertSummaryPage {...getPageProps(getDefaultProps)} />);
      expect(screen.queryByTestId('advertStatusTag')).toBeFalsy();
    });
  });
});
