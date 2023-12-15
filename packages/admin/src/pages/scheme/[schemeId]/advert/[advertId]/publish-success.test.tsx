import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { getAdvertStatusBySchemeId } from '../../../../../services/AdvertPageService';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import PublishSuccessPage, { getServerSideProps } from './publish-success.page';
import { GetServerSidePropsContext } from 'next';
import {
  getContext,
  Optional,
  mockServiceMethod,
  InferServiceMethodResponse,
  expectObjectEquals,
  getPageProps,
} from '../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../types/InferProps';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';

jest.mock('../../../../../services/AdvertPageService');

const mockedGetAdvertStatusBySchemeId =
  getAdvertStatusBySchemeId as jest.MockedFn<typeof getAdvertStatusBySchemeId>;

const getDefaultPageContent = (): InferServiceMethodResponse<
  typeof getAdvertStatusBySchemeId
> => ({
  status: 200,
  data: {
    grantAdvertId: 'advert-id',
    grantAdvertStatus: AdvertStatusEnum.PUBLISHED,
    contentfulSlug: 'contentful-slug',
  },
});

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  backToAccountLink: `/scheme/schemeId`,
  linkToAdvertInFindAGrant: `link-to-find/grants/some-contentful-slug`,
});

const axiosError = {
  response: {
    data: {
      code: 'GRANT_ADVERT_NOT_FOUND',
    },
  },
};

describe('Advert - Publish Success Page', () => {
  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'schemeId',
        advertId: 'advertId',
      },
    });

    beforeEach(() => {
      process.env.FIND_A_GRANT_URL = 'https://some-url.com';
    });
    it('Should return the link to advert as a prop when slug is provided', async () => {
      mockServiceMethod(mockedGetAdvertStatusBySchemeId, getDefaultPageContent);

      const result = (await getServerSideProps(
        getContext(getDefaultContext)
      )) as NextGetServerSidePropsResponse;

      expect(result.props.backToAccountLink).toStrictEqual('/scheme/schemeId');
      expect(result.props.linkToAdvertInFindAGrant).toStrictEqual(
        `https://some-url.com/grants/contentful-slug`
      );
    });

    it('Should redirect from the publish success page to section overview if advert not published', async () => {
      mockServiceMethod(
        mockedGetAdvertStatusBySchemeId,
        getDefaultPageContent,
        { data: { grantAdvertStatus: AdvertStatusEnum.DRAFT } }
      );

      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          statusCode: 307,
          destination: `/scheme/schemeId/advert/advertId/section-overview`,
        },
      });
    });

    it('Should redirect to service error when error occurs getting advert status', async () => {
      mockedGetAdvertStatusBySchemeId.mockRejectedValue(axiosError);
      const result = await getServerSideProps(getContext(getDefaultContext));

      expectObjectEquals(result, {
        redirect: {
          statusCode: 302,
          destination:
            '/error-page/code/GRANT_ADVERT_NOT_FOUND?href=/scheme/schemeId/advert/advertId/section-overview',
        },
      });
    });
  });

  describe('Publish Success Page', () => {
    beforeEach(() => {
      render(<PublishSuccessPage {...getPageProps(getDefaultProps)} />);
    });

    it('Should render a meta title', () => {
      expect(document.title).toBe('Publish grant advert - Manage a grant');
    });

    it('Should render title of the page', () => {
      screen.getByText('Grant advert published');
    });
    it("Should render 'Back to my account' button", () => {
      expect(
        screen.getByRole('button', { name: 'Back to my account' })
      ).toHaveAttribute('href', '/apply/scheme/schemeId');
    });

    it('Should render a link provided by server side props', () => {
      expect(
        screen.getByRole('link', {
          name: 'link-to-find/grants/some-contentful-slug',
        })
      ).toHaveAttribute('href', 'link-to-find/grants/some-contentful-slug');
    });

    it('Should render body text messages', () => {
      screen.getByText(/Here is a link to your advert on Find a grant:/i);
      screen.getByText(
        /You can make changes to your advert or unpublish it at any time./i
      );
    });
  });
});
