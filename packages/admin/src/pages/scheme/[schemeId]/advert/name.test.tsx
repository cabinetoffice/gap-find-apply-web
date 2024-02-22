import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsResult, Redirect } from 'next';
import { parseBody } from '../../../../utils/parseBody';
import { createNewAdvert } from '../../../../services/AdvertPageService';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import AdvertName, { getServerSideProps } from './name.page';

jest.mock('../../../../services/SessionService');
jest.mock('../../../../services/SchemeService');
jest.mock('../../../../services/AdvertPageService');
jest.mock('../../../../utils/parseBody');

const getProps = (overrides: any = {}) =>
  merge(
    {
      fieldErrors: [],
      backButtonHref: '/scheme/12345',
      formAction: '/mock/formAction',
      csrfToken: 'testCsrfToken',
    },
    overrides
  );

const component = <AdvertName {...getProps()} />;

describe('Application name page', () => {
  describe('UI/rendering', () => {
    it('Should render a meta title WITHOUT "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe(
        'Grant name - Create an advert - Manage a grant'
      );
    });

    it('Should render a meta title WITH "Error: " when fieldErrors is NOT empty', () => {
      render(
        <AdvertName
          {...getProps({
            fieldErrors: [{ fieldName: 'grantName', errorMessage: 'Required' }],
          })}
        />
      );

      expect(document.title).toBe(
        'Error: Grant name - Create an advert - Manage a grant'
      );
    });

    it('Renders the question page layout output', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Should render a back button', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/admin/scheme/12345'
      );
    });

    it('Should render correct text input component', () => {
      render(component);

      screen.getByTestId('text-input-component');
      screen.getByText('What is the name of your grant?');
    });

    it('Should render correct button component', () => {
      render(component);

      screen.getByRole('button', { name: 'Save and continue' });
    });
  });

  describe('getServerSideProps', () => {
    const getContext = (overrides: any = {}) =>
      merge(
        {
          params: {
            schemeId: '12345',
          } as Record<string, string>,
          req: {
            method: 'GET',
            cookies: { session_id: 'test-session-id' },
          },
          res: { getHeader: () => 'testCSRFToken' },
          resolvedUrl: '/mock/resolvedUrl',
        },
        overrides
      );

    const getPostContext = (overrides: any = {}) =>
      merge(getContext({ req: { method: 'POST' } }), overrides);

    it('Should return a backButtonHref', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.backButtonHref).toStrictEqual('/scheme/12345');
    });

    it('Should return a formAction', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.formAction).toStrictEqual(
        process.env.SUB_PATH + '/mock/resolvedUrl'
      );
    });

    it('Should return a csrfToken', async () => {
      const response = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(response.props.csrfToken).toStrictEqual('testCSRFToken');
    });

    describe('GET request', () => {
      it('Should return empty array of fieldErrors', async () => {
        const response = (await getServerSideProps(
          getContext()
        )) as NextGetServerSidePropsResponse;

        expect(response.props.fieldErrors).toStrictEqual([]);
      });

      describe('Error handling', () => {
        const getContext = (overrides: any = {}) =>
          merge(
            {
              params: {} as Record<string, string>,
              req: {
                method: 'GET',
                cookies: { session_id: 'test-session-id' },
              },
            },
            overrides
          );

        it('Should redirect to service error page when schemeId is not provided', async () => {
          const response = (await getServerSideProps(
            getContext()
          )) as GetServerSidePropsResult<Redirect>;

          expect(response).toStrictEqual({
            redirect: {
              destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create a new advert.","linkAttributes":{"href":"/dashboard","linkText":"Please return","linkInformation":" and try again."}}`,
              statusCode: 302,
            },
          });
        });
      });
    });

    describe('POST request', () => {
      // Does nto function right now because backend has no error handling. Uncomment when it gets merged in.
      // it('Should return fieldErrors', async () => {
      // (parseBody as jest.Mock).mockResolvedValue({
      //   name: '',
      //   _csrf: 'testCSRF',
      // });

      //   (createNewAdvert as jest.Mock).mockResolvedValue({
      //     response: {
      //       data: {
      //         fieldErrors: [
      //           {
      //             fieldName: 'name',
      //             errorMessage: 'Example error name field',
      //           },
      //         ],
      //       },
      //     },
      //   });

      //   const response = (await getServerSideProps(
      //     getPostContext()
      //   )) as NextGetServerSidePropsResponse;

      //   expect(response.props.fieldErrors).toStrictEqual({
      //     fieldName: 'name',
      //     errorMessage: 'Example error name field',
      //   });
      // });

      describe('Error handling', () => {
        it('Should redirect success redirect when creating new advert succeeds', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            name: '',
            _csrf: 'testCSRF',
          });

          (createNewAdvert as jest.Mock).mockResolvedValue({
            response: {
              data: {
                fieldErrors: [
                  {
                    fieldName: 'name',
                    errorMessage: 'Example error name field',
                  },
                ],
              },
            },
          });

          const response = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(response).toStrictEqual({
            redirect: {
              destination: '/scheme/12345/advert/undefined/section-overview',
              statusCode: 302,
            },
          });
        });

        it('Should return relevant validation errors', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            name: '',
            _csrf: 'testCSRF',
          });

          (createNewAdvert as jest.Mock).mockRejectedValue({
            response: {
              data: {
                body: {
                  name: '',
                },
                fieldErrors: [
                  {
                    fieldName: 'name',
                    errorMessage: 'Example fieldError ',
                  },
                ],
              },
            },
          });

          const response = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(response.props.fieldErrors).toStrictEqual([
            { errorMessage: 'Example fieldError ', fieldName: 'name' },
          ]);
        });

        it('Should redirect to service error page when the service method throws an error', async () => {
          (parseBody as jest.Mock).mockResolvedValue({
            name: '',
            _csrf: 'testCSRF',
          });

          (createNewAdvert as jest.Mock).mockRejectedValue({});

          const response = (await getServerSideProps(
            getPostContext()
          )) as NextGetServerSidePropsResponse;

          expect(response).toStrictEqual({
            redirect: {
              destination:
                '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to create a new advert.","linkAttributes":{"href":"/scheme/12345/advert/name","linkText":"Please return","linkInformation":" and try again."}}',
              statusCode: 302,
            },
          });
        });
      });
    });
  });
});
