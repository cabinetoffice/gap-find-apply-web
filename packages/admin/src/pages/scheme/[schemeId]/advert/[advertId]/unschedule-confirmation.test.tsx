import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import {
  getAdvertStatusBySchemeId,
  unscheduleAdvert,
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

import UnscheduleConfirmationPage, {
  getServerSideProps,
} from './unschedule-confirmation.page';
import { parseBody } from '../../../../../utils/parseBody';
import AdvertStatusEnum from '../../../../../enums/AdvertStatus';

jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/AdvertPageService');

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  backHref: '/testBackLink',
  formAction: '/testResolvedURL',
  fieldErrors: [],
  csrfToken: 'testCSRFToken',
});

const mockedGetAdvertStatusBySchemeId =
  getAdvertStatusBySchemeId as jest.MockedFn<typeof getAdvertStatusBySchemeId>;

const mockedUnscheduleAdvert = unscheduleAdvert as jest.MockedFn<
  typeof unscheduleAdvert
>;

const getDefaultGrantAdvertData = (): InferServiceMethodResponse<
  typeof getAdvertStatusBySchemeId
> => ({
  status: 200,
  data: {
    grantAdvertId: 'testAdvertId',
    grantAdvertStatus: AdvertStatusEnum.SCHEDULED,
    contentfulSlug: 'test-contentful-slug',
  },
});

process.env.SESSION_COOKIE_NAME = 'gap-test';

describe('Unschedule confirmation page', () => {
  describe('UI', () => {
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

      expect(document.title).toBe('Unschedule advert - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <UnscheduleConfirmationPage
          {...getPageProps(getDefaultProps, {
            fieldErrors: [
              {
                fieldName: 'confirmation',
                errorMessage:
                  'You must select either "Yes, unschedule my advert" or "No, keep my advert scheduled"',
              },
            ],
          })}
        />
      );

      expect(document.title).toBe('Error: Unschedule advert - Manage a grant');
    });

    it('Should render a back button', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/testBackLink'
      );
    });

    it('Should render title of the page', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('heading', {
        name: 'Are you sure you want to change your advert?',
      });
    });

    it('Should render correct question hint', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByText(
        'Your advert will be unscheduled. To schedule your advert, you will need to review and publish it again.'
      );
    });

    it('Should render a yes/no radio input', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

      screen.getByRole('radio', { name: 'Yes, unschedule my advert' });
      screen.getByRole('radio', { name: 'No, keep my advert scheduled' });
    });

    it('Should render a confirm button', () => {
      render(<UnscheduleConfirmationPage {...getPageProps(getDefaultProps)} />);

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
      res: { getHeader: () => 'testCSRFToken' },
    });

    describe('When handling GET request', () => {
      it('Should redirect to error page if advert is not scheduled', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData,
          { data: { grantAdvertStatus: AdvertStatusEnum.DRAFT } }
        );

        const result = await getServerSideProps(getContext(getDefaultContext));

        expectObjectEquals(result, {
          redirect: {
            statusCode: 302,
            destination: `/error-page/code/GRANT_ADVERT_NOT_SCHEDULED?href=/scheme/testSchemeId`,
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
              'You must select either "Yes, unschedule my advert" or "No, keep my advert scheduled"',
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
        res: { getHeader: () => 'testCSRFToken' },
      });

      it('Should redirect to "Section overview" page when advert is successfully unscheduled', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({
          confirmation: 'true',
        });

        const result = await getServerSideProps(getContext(getDefaultContext));

        toHaveBeenCalledWith(
          mockedUnscheduleAdvert,
          1,
          'testSessionId',
          'testAdvertId'
        );

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/scheme/testSchemeId/advert/testAdvertId/section-overview',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to summary page when advert user selects a negative option', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({
          confirmation: 'false',
        });

        const result = await getServerSideProps(getContext(getDefaultContext));

        expect(mockedUnscheduleAdvert).toHaveBeenCalledTimes(0);

        expectObjectEquals(result, {
          redirect: {
            destination: '/scheme/testSchemeId/advert/testAdvertId/summary',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to "Unschedule confirmation" page with field errors when user tries to submit without selecting an option', async () => {
        mockServiceMethod(
          mockedGetAdvertStatusBySchemeId,
          getDefaultGrantAdvertData
        );

        (parseBody as jest.Mock).mockResolvedValue({});

        const result = await getServerSideProps(getContext(getDefaultContext));

        expect(mockedUnscheduleAdvert).toHaveBeenCalledTimes(0);

        expectObjectEquals(result, {
          redirect: {
            destination:
              '/scheme/testSchemeId/advert/testAdvertId/unschedule-confirmation?hasErrors=true',
            statusCode: 302,
          },
        });
      });
    });
  });
});
