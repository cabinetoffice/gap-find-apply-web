import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import {
  getAdvertStatusBySchemeId,
  unpublishAdvert,
} from '../../../../../services/AdvertPageService';
import InferProps from '../../../../../types/InferProps';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import {
  expectObjectEquals,
  getContext,
  getPageProps,
  InferServiceMethodResponse,
  mockServiceMethod,
  Optional,
  toHaveBeenCalledWith,
} from '../../../../../testUtils/unitTestHelpers';
import UnpublishConfirmationPage, {
  getServerSideProps,
} from './unpublish-confirmation.page';
import { parseBody } from 'next/dist/server/api-utils/node';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';

jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../../services/AdvertPageService');

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  backHref: '/testBackLink',
  formAction: '/testResolvedURL',
  fieldErrors: [],
  csrfToken: 'testCSRFToken',
});

const mockedGetAdvertStatusBySchemeId =
  getAdvertStatusBySchemeId as jest.MockedFn<typeof getAdvertStatusBySchemeId>;

const mockedUnpublishAdvert = unpublishAdvert as jest.MockedFn<
  typeof unpublishAdvert
>;

const getDefaultGrantAdvertData = (): InferServiceMethodResponse<
  typeof getAdvertStatusBySchemeId
> => ({
  status: 200,
  data: {
    grantAdvertId: 'testAdvertId',
    grantAdvertStatus: AdvertStatusEnum.PUBLISHED,
    contentfulSlug: 'test-contentful-slug',
  },
});

process.env.SESSION_COOKIE_NAME = 'gap-test';

describe('Unpublish confirmation page', () => {
  describe('UI', () => {
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      expect(document.title).toBe('Unpublish advert - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <UnpublishConfirmationPage
          {...getPageProps(getDefaultProps, {
            fieldErrors: [
              {
                fieldName: 'confirmation',
                errorMessage:
                  "You must select either ‘Yes, unpublish my advert' or ‘No, keep my advert on Find a grant.'",
              },
            ],
          })}
        />
      );

      expect(document.title).toBe('Error: Unpublish advert - Manage a grant');
    });

    it('Should render a back button', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/testBackLink'
      );
    });

    it('Should render title of the page', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('heading', {
        name: 'Are you sure you want to unpublish this advert?',
      });
    });

    it('Should render correct question hint', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByText(
        'Once unpublished, your advert will no longer appear on Find a grant.'
      );
    });

    it('Should render a yes/no radio input', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('radio', { name: 'Yes, unpublish my advert' });
      screen.getByRole('radio', { name: 'No, keep my advert on Find a grant' });
    });

    it('Should render a confirm button', () => {
      render(<UnpublishConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('button', { name: 'Confirm' });
    });
  });

  describe('getServerSideProps', () => {
    const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
      params: {
        schemeId: 'testSchemeId',
        advertId: 'testAdvertId',
      },
      query: {},
    });

    describe('When handling GET request', () => {
      it('Should redirect to error page if advert is not published', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData,
          { data: { grantAdvertStatus: AdvertStatusEnum.DRAFT } }
        );

        const result = await getServerSideProps(getContext(getDefaultContext));

        expectObjectEquals(result, {
          redirect: {
            statusCode: 302,
            destination: `/error-page/code/GRANT_ADVERT_NOT_PUBLISHED?href=/scheme/testSchemeId`,
          },
        });
      });

      it('Should redirect to error page if getting advert information throws an error', async () => {
        mockedGetAdvertStatusBySchemeId.mockRejectedValue({
          response: { data: { code: 'testCode' } },
        });

        const result = await getServerSideProps(getContext(getDefaultContext));

        expectObjectEquals(result, {
          redirect: {
            statusCode: 302,
            destination: `/error-page/code/testCode?href=/scheme/testSchemeId`,
          },
        });
      });

      it('Should return a non-empty fieldErrors prop if URL has a "hasErrors" property', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        const result = (await getServerSideProps(
          getContext(getDefaultContext, { query: { hasErrors: 'true' } })
        )) as NextGetServerSidePropsResponse;

        expect(result.props.fieldErrors).toStrictEqual([
          {
            errorMessage:
              "You must select either ‘Yes, unpublish my advert' or ‘No, keep my advert on Find a grant.'",
            fieldName: 'confirmation',
          },
        ]);
      });
    });

    describe('When handling POST request', () => {
      const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
        params: {
          schemeId: 'testSchemeId',
          advertId: 'testAdvertId',
        },
        query: {},
        req: {
          method: 'POST',
        },
      });

      it('Should redirect to "Section overview" page with "recentlyUnpublished" tag when advert is successfully unpublished', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({
          confirmation: 'true',
        });

        const result = await getServerSideProps(getContext(getDefaultContext));

        toHaveBeenCalledWith(
          mockedUnpublishAdvert,
          1,
          'testSessionId',
          'testAdvertId'
        );

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/scheme/testSchemeId/advert/testAdvertId/section-overview?recentlyUnpublished=true',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to summary page when advert user selects a negattive option', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({
          confirmation: 'false',
        });

        const result = await getServerSideProps(getContext(getDefaultContext));

        expect(mockedUnpublishAdvert).toHaveBeenCalledTimes(0);

        expectObjectEquals(result, {
          redirect: {
            destination: '/scheme/testSchemeId/advert/testAdvertId/summary',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to "Unpublish confirmation" page with field errors when user tries to submit without selecting an option', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({});

        const result = await getServerSideProps(getContext(getDefaultContext));

        expect(mockedUnpublishAdvert).toHaveBeenCalledTimes(0);

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/scheme/testSchemeId/advert/testAdvertId/unpublish-confirmation?hasErrors=true',
            statusCode: 302,
          },
        });
      });
    });
  });
});
