import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext, Redirect } from 'next';
import NextGetServerSidePropsResponse from '../../../../types/NextGetServerSidePropsResponse';
import DeleteSectionContent, {
  getServerSideProps,
} from './delete-confirmation.page';
import { deleteSection } from '../../../../services/SectionService';
import { parseBody } from 'next/dist/server/api-utils/node';

jest.mock('next/config', () => () => {
  return {
    serverRuntimeConfig: {
      backendHost: 'http://localhost:8080',
    },
    publicRuntimeConfig: {
      SUB_PATH: '/apply',
      APPLICANT_DOMAIN: 'http://localhost:8080',
    },
  };
});
jest.mock('next/dist/server/api-utils/node');
jest.mock('../../../../services/SectionService');
jest.mock('../../../../services/ApplicationService');

const APPLICATION_ID = 'testApplicationId';
const SECTION_ID = 'testSectionId';

const customProps = {
  fieldErrors: [],
  backButtonHref: '/dashboard',
  formAction: '',
  defaultValue: '',
  deleteBool: 'No',
};

const expectedRedirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to delete a section","linkAttributes":{"href":"/","linkText":"Please return","linkInformation":" and try again."}}`,
    statusCode: 302,
  } as Redirect,
};

const component = <DeleteSectionContent {...customProps} />;

const getContext = (overrides: any = {}) =>
  merge(
    {
      params: {
        applicationId: APPLICATION_ID,
        sectionId: SECTION_ID,
      } as Record<string, string>,
      req: {
        method: 'GET',
        cookies: { 'gap-test': 'testSessionId' },
      } as any,
      resolvedUrl:
        '/build-application/testApplicationId/testSectionId/delete-confirmation',
    } as GetServerSidePropsContext,
    overrides
  );

describe('Delete section page', () => {
  describe('UI', () => {
    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Delete this section - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <DeleteSectionContent
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe(
        'Error: Delete this section - Manage a grant'
      );
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/dashboard'
      );
    });

    it('Renders the delete section page layout output', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Renders radio input to confirm whether to delete section or not', () => {
      render(component);
      screen.getByTestId('radioFormDiv');
    });

    it('Renders "Confirm" button', () => {
      render(component);
      screen.getByRole('button', { name: 'Confirm' });
    });
  });

  describe('when handling a GET request', () => {
    beforeEach(() => {
      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

    it('Should NOT attempt to delete a section', async () => {
      await getServerSideProps(getContext());
      expect(deleteSection).not.toHaveBeenCalled();
    });

    it('Should return an empty array of field errors', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.fieldErrors).toStrictEqual([]);
    });

    it('Should return a form action', async () => {
      const value = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(value.props.formAction).toStrictEqual(
        `/build-application/${APPLICATION_ID}/${SECTION_ID}/delete-confirmation`
      );
    });
  });

  describe('when handling a POST request', () => {
    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({
        deleteBool: 'true',
      });
      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

    const getPostContext = (overrides: any = {}) =>
      getContext(merge({ req: { method: 'POST' } }, overrides));

    it('Should redirect to the error service page when deleting a section fails', async () => {
      (deleteSection as jest.Mock).mockRejectedValue({});

      const value = (await getServerSideProps(
        getPostContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual(expectedRedirectObject);
    });

    it('Should redirect to the dashboard when deleting a section succeeds', async () => {
      (deleteSection as jest.Mock).mockResolvedValue({});

      const value = (await getServerSideProps(
        getPostContext()
      )) as NextGetServerSidePropsResponse;

      expect(value).toStrictEqual({
        redirect: {
          destination: `/build-application/${APPLICATION_ID}/dashboard`,
          statusCode: 302,
        },
      });
    });
  });
});
