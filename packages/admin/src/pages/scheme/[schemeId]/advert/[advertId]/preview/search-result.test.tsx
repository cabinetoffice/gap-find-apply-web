import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { Redirect } from 'next';
import * as AdvertPageService from '../../../../../../services/AdvertPageService';
import * as serviceErrorHelpers from '../../../../../../utils/serviceErrorHelpers';
import * as sessionUtils from '../../../../../../utils/session';
import SearchResultPreview, { getServerSideProps } from './search-result.page';

jest.mock('../../../../../../utils/session');
jest.mock('../../../../../../services/AdvertPageService');
jest.mock('../../../../../../utils/serviceErrorHelpers');
jest.mock('../../../../../../utils/parseBody');

const mockSessionUtils = jest.mocked(sessionUtils);
const mockAdvertPageService = jest.mocked(AdvertPageService);
const mockServiceErrorHelpers = jest.mocked(serviceErrorHelpers);
const sessionCookie = 'MTJlZDE5YjktNTAwZS00MWE2LTlmNjMtMTk0MjY1ODJlZmIw';

const backendResponse = {
  id: 'advertId',
  advertName: 'Testing Grant',
  sections: [
    {
      id: 'grantDetails',
      title: '1. Grant details',
      pages: [
        {
          id: '1',
          title: 'Short description',
          questions: [
            {
              id: 'grantShortDescription',
              title: 'Short description',
              summarySuffixText: '',
              response:
                'This is the short description. Lorem ipsum dolor sit amet consectetur adipiscing elit lectus mus, pretium cras pharetra cum sem quisque dignissim condimentum duis tristique, proin id accumsan platea dapibus nostra eros mi. Iaculis egestas sapien ac orci vehicula turpis tortor, nascetur nullam leo vitae ultrices viverra erat, senectus diam sociis lacus eleifend donec.',
              responseType: 'LONG_TEXT',
            },
          ],
        },
        {
          id: '2',
          title: 'Location',
          questions: [
            {
              id: 'grantLocation',
              title: 'Location',
              summarySuffixText: '',
              multiResponse: [
                'England',
                'Wales',
                'Scotland',
                'Northern Ireland',
              ],
              responseType: 'LIST',
            },
          ],
        },
        {
          id: '3',
          title: 'Funding organisation',
          questions: [
            {
              id: 'grantFunder',
              title: 'Funding organisation',
              summarySuffixText: '',
              response: "The Grant Funders' Organisation",
              responseType: 'SHORT_TEXT',
            },
          ],
        },
        {
          id: '4',
          title: 'Who can apply',
          questions: [
            {
              id: 'grantApplicantType',
              title: 'Who can apply',
              summarySuffixText: '',
              multiResponse: [
                'Personal / Individual',
                'Public Sector',
                'Non-profit',
                'Private Sector',
                'Local authority',
              ],
              responseType: 'LIST',
            },
          ],
        },
      ],
    },
    {
      id: 'awardAmounts',
      title: '2. Award amounts',
      pages: [
        {
          id: '1',
          title: 'How much funding is available?',
          questions: [
            {
              id: 'grantTotalAwardAmount',
              title: 'Total amount of the grant',
              summarySuffixText: '',
              response: '£1 million',
              responseType: 'CURRENCY',
            },
            {
              id: 'grantMaximumAward',
              title: 'Maximum amount someone can apply for',
              summarySuffixText: '',
              response: '£500,000',
              responseType: 'CURRENCY',
            },
            {
              id: 'grantMinimumAward',
              title: 'Minimum amount someone can apply for',
              summarySuffixText: '',
              response: '£100',
              responseType: 'CURRENCY',
            },
          ],
        },
      ],
    },
    {
      id: 'applicationDates',
      title: '3. Application dates',
      pages: [
        {
          id: '1',
          title: 'Opening and closing dates',
          questions: [
            {
              id: 'grantApplicationOpenDate',
              title: 'Opening',
              summarySuffixText: 'When your advert is published',
              multiResponse: ['01', '01', '2024', '00', '00'],
              responseType: 'DATE',
            },
            {
              id: 'grantApplicationCloseDate',
              title: 'Closing',
              summarySuffixText: 'When your advert is unpublished',
              multiResponse: ['01', '1', '2026', '00', '00'],
              responseType: 'DATE',
            },
          ],
        },
      ],
    },
  ],
  status: 'DRAFT',
};

const mockGrant = {
  grantName: 'Testing Grant',
  grantShortDescription:
    'This is the short description. Lorem ipsum dolor sit amet consectetur adipiscing elit lectus mus, pretium cras pharetra cum sem quisque dignissim condimentum duis tristique, proin id accumsan platea dapibus nostra eros mi. Iaculis egestas sapien ac orci vehicula turpis tortor, nascetur nullam leo vitae ultrices viverra erat, senectus diam sociis lacus eleifend donec.',
  grantLocation: ['England', 'Wales', 'Scotland', 'Northern Ireland'],
  grantFundingOrganisation: "The Grant Funders' Organisation",
  grantApplicantType: [
    'Personal / Individual',
    'Public Sector',
    'Non-profit',
    'Private Sector',
    'Local authority',
  ],
  grantTotalAwardAmount: '£1 million',
  grantMaximumAward: '£500,000',
  grantMinimumAward: '£100',
  grantApplicationOpenDate: ['01', '01', '2024', '00', '00'],
  grantApplicationCloseDate: ['01', '1', '2026', '00', '00'],
};

const emptyBackendResponse = {
  id: 'advertId',
  advertName: '',
  sections: [
    {
      id: 'grantDetails',
      title: '1. Grant details',
      pages: [
        {
          id: '1',
          title: 'Short description',
          questions: [
            {
              id: 'grantShortDescription',
              title: 'Short description',
              summarySuffixText: '',
              responseType: 'LONG_TEXT',
            },
          ],
        },
        {
          id: '2',
          title: 'Location',
          questions: [
            {
              id: 'grantLocation',
              title: 'Location',
              summarySuffixText: '',
              responseType: 'LIST',
            },
          ],
        },
        {
          id: '3',
          title: 'Funding organisation',
          questions: [
            {
              id: 'grantFunder',
              title: 'Funding organisation',
              summarySuffixText: '',
              responseType: 'SHORT_TEXT',
            },
          ],
        },
        {
          id: '4',
          title: 'Who can apply',
          questions: [
            {
              id: 'grantApplicantType',
              title: 'Who can apply',
              summarySuffixText: '',
              responseType: 'LIST',
            },
          ],
        },
      ],
    },
    {
      id: 'awardAmounts',
      title: '2. Award amounts',
      pages: [
        {
          id: '1',
          title: 'How much funding is available?',
          questions: [
            {
              id: 'grantTotalAwardAmount',
              title: 'Total amount of the grant',
              summarySuffixText: '',
              responseType: 'CURRENCY',
            },
            {
              id: 'grantMaximumAward',
              title: 'Maximum amount someone can apply for',
              summarySuffixText: '',
              responseType: 'CURRENCY',
            },
            {
              id: 'grantMinimumAward',
              title: 'Minimum amount someone can apply for',
              summarySuffixText: '',
              responseType: 'CURRENCY',
            },
          ],
        },
      ],
    },
    {
      id: 'applicationDates',
      title: '3. Application dates',
      pages: [
        {
          id: '1',
          title: 'Opening and closing dates',
          questions: [
            {
              id: 'grantApplicationOpenDate',
              title: 'Opening',
              summarySuffixText: 'When your advert is published',
              responseType: 'DATE',
            },
            {
              id: 'grantApplicationCloseDate',
              title: 'Closing',
              summarySuffixText: 'When your advert is unpublished',
              responseType: 'DATE',
            },
          ],
        },
      ],
    },
  ],
  status: 'DRAFT',
};

const emptyGrant = {
  grantName: '',
  grantShortDescription: '',
  grantLocation: [],
  grantFundingOrganisation: '',
  grantApplicantType: [],
  grantTotalAwardAmount: '',
  grantMaximumAward: '',
  grantMinimumAward: '',
  grantApplicationOpenDate: [],
  grantApplicationCloseDate: [],
};

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
    },
    overrides
  );

const axiosError = {
  response: {
    data: {
      code: 'GRANT_ADVERT_NOT_FOUND',
    },
  },
};

const props = {
  grant: { ...mockGrant },
  advertId: getContext().params.advertId,
  schemeId: getContext().params.schemeId,
  findSearchUrl: 'FIND-URL/grants',
};

const emptyProps = {
  grant: { ...emptyGrant },
  advertId: getContext().params.advertId,
  schemeId: getContext().params.schemeId,
  findSearchUrl: 'FIND-URL/grants',
};

describe('getServerSideProps', () => {
  beforeEach(() => {
    mockSessionUtils.getSessionIdFromCookies.mockReturnValue(sessionCookie);
    mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
      backendResponse
    );
    process.env.FIND_A_GRANT_URL = 'FIND-URL';
  });

  describe('request error', () => {
    it('session should be called with the right params ', async () => {
      mockSessionUtils.getSessionIdFromCookies.mockReturnValue(sessionCookie);
      const context = getContext();

      await getServerSideProps(context);

      expect(mockSessionUtils.getSessionIdFromCookies).toBeCalledWith(
        context.req
      );
    });
    it('should have the expected redirection', async () => {
      mockAdvertPageService.getSummaryPageContent.mockRejectedValue(axiosError);

      const expectedResult = {
        redirect: {
          destination:
            '/error-page/code/GRANT_ADVERT_NOT_FOUND?href=/dashboard',
          statusCode: 302,
        } as Redirect,
      };

      const mockGenerateErrorPageRedirectForAdvertPages =
        mockServiceErrorHelpers.generateErrorPageRedirectV2.mockReturnValue(
          expectedResult
        );

      const context = getContext();

      const result = await getServerSideProps(context);

      expect(mockGenerateErrorPageRedirectForAdvertPages).toBeCalledWith(
        axiosError.response.data.code,
        `/scheme/${getContext().params.schemeId}/advert/${
          getContext().params.advertId
        }/section-overview`
      );
      expect(result).toStrictEqual(expectedResult);
    });

    it('backed should have been called with the right params', async () => {
      mockAdvertPageService.getSummaryPageContent.mockRejectedValue(axiosError);
      const context = getContext();

      await getServerSideProps(context);
      expect(mockAdvertPageService.getSummaryPageContent).toBeCalledWith(
        sessionCookie,
        context.params.schemeId,
        context.params.advertId
      );
    });
  });
  describe('request success', () => {
    it('should return the expected props', async () => {
      mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
        backendResponse
      );
      const context = getContext();

      const result = await getServerSideProps(context);
      expect(result).toStrictEqual({
        props,
      });
    });

    it('should return the expected props when data is not present', async () => {
      mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
        emptyBackendResponse
      );
      const context = getContext();

      const result = await getServerSideProps(context);
      expect(result).toStrictEqual({
        props: emptyProps,
      });
    });

    it('backend should be called with the right params ', async () => {
      mockAdvertPageService.getSummaryPageContent.mockResolvedValue(
        backendResponse
      );
      const context = getContext();

      await getServerSideProps(context);

      expect(mockAdvertPageService.getSummaryPageContent).toBeCalledWith(
        sessionCookie,
        context.params.schemeId,
        context.params.advertId
      );
    });
    it('session should be called with the right params ', async () => {
      const context = getContext();

      await getServerSideProps(context);

      expect(mockSessionUtils.getSessionIdFromCookies).toBeCalledWith(
        context.req
      );
    });
  });
});
describe('Advert Search Preview page', () => {
  beforeEach(() => {
    render(<SearchResultPreview {...props} />);
  });

  it('should render back button', () => {
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${props.schemeId}/advert/${props.advertId}/section-overview`
    );
  });

  it('should render Continue button', () => {
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute(
      'href',
      `/apply/scheme/${props.schemeId}/advert/${props.advertId}/preview/advert-details`
    );
  });

  it('should render page title and preview details', () => {
    screen.getByText('How your advert looks to applicants');
    screen.getByText('Search results page');
    screen.getByTestId('previewDetails');
  });

  it('should render the PreviewSearchCard component', () => {
    screen.getByTestId('advert-preview-search-card-div');
  });

  it('should render correct meta title', () => {
    expect(document.title).toBe(
      `${props.grant.grantName} preview - Manage a grant`
    );
  });
});
