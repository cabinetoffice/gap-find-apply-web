import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { Redirect } from 'next';
import * as AdvertPageService from '../../../../../../services/AdvertPageService';
import * as serviceErrorHelpers from '../../../../../../utils/serviceErrorHelpers';
import * as sessionUtils from '../../../../../../utils/session';
import AdvertPreview, { getServerSideProps } from './preview';

jest.mock('../../../../../../utils/session');
jest.mock('../../../../../../services/AdvertPageService');
jest.mock('../../../../../../utils/serviceErrorHelpers');
jest.mock('next/dist/server/api-utils/node');

const mockSessionUtils = jest.mocked(sessionUtils);
const mockAdvertPageService = jest.mocked(AdvertPageService);
const mockServiceErrorHelpers = jest.mocked(serviceErrorHelpers);
const sessionCookie = 'MTJlZDE5YjktNTAwZS00MWE2LTlmNjMtMTk0MjY1ODJlZmIw';

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

const backendResponse = {
  grantName: 'grantName',
  grantShortDescription: 'description',
  grantApplicationOpenDate: 'openDate',
  grantApplicationCloseDate: 'closeDate',
  tabs: [
    { name: 'tab1', content: '' },
    {
      name: 'tab2',
      content:
        '{"nodeType":"document","data":{},"content":[{"nodeType":"paragraph","content":[{"nodeType":"text","value":"Supporting info...","marks":[],"data":{}}],"data":{}}]}',
    },
  ],
};

const axiosError = {
  response: {
    data: {
      code: 'GRANT_ADVERT_NOT_FOUND',
    },
  },
};

const props = {
  grant: { ...backendResponse },
  advertId: getContext().params.advertId,
  schemeId: getContext().params.schemeId,
};

describe('getServerSideProps', () => {
  beforeEach(() => {
    mockSessionUtils.getSessionIdFromCookies.mockReturnValue(sessionCookie);
    mockAdvertPageService.getAdvertPreviewPageContent.mockResolvedValue(
      backendResponse
    );
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
      mockAdvertPageService.getAdvertPreviewPageContent.mockRejectedValue(
        axiosError
      );

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
      mockAdvertPageService.getAdvertPreviewPageContent.mockRejectedValue(
        axiosError
      );
      const context = getContext();

      await getServerSideProps(context);
      expect(mockAdvertPageService.getAdvertPreviewPageContent).toBeCalledWith(
        sessionCookie,
        context.params.advertId
      );
    });
  });
  describe('request success', () => {
    it('should return the expected props ', async () => {
      mockAdvertPageService.getAdvertPreviewPageContent.mockResolvedValue(
        backendResponse
      );
      const context = getContext();

      const result = await getServerSideProps(context);
      expect(result).toStrictEqual({
        props,
      });
    });
    it('backend should be called with the right params ', async () => {
      mockAdvertPageService.getAdvertPreviewPageContent.mockResolvedValue(
        backendResponse
      );
      const context = getContext();

      await getServerSideProps(context);

      expect(mockAdvertPageService.getAdvertPreviewPageContent).toBeCalledWith(
        sessionCookie,
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
describe('Advert Preview page', () => {
  beforeEach(() => {
    render(<AdvertPreview {...props} />);
  });
  it('Should render back button', () => {
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      `/apply/scheme/${props.schemeId}/advert/${props.advertId}/section-overview`
    );
  });
  it('Should render Back to create your advert button', () => {
    expect(
      screen.getByRole('button', { name: 'Back to create your advert' })
    ).toHaveAttribute(
      'href',
      `/apply/scheme/${props.schemeId}/advert/${props.advertId}/section-overview`
    );
  });

  it('should render the pageDetailsHeader component', () => {
    screen.getByTestId('advert-preview-details-header-div');
  });

  it('should render the pageDetailsTab component', () => {
    screen.getByTestId('advert-preview-tabs-div');
  });

  it('should render correct meta title', () => {
    expect(document.title).toBe(
      `${props.grant.grantName} preview - Manage a grant`
    );
  });
});
