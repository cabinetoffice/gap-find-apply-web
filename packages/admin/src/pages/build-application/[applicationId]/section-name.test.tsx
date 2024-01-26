import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GetServerSidePropsContext } from 'next';
import NextGetServerSidePropsResponse from '../../../types/NextGetServerSidePropsResponse';
import { merge } from 'lodash';
import axios from 'axios';
import { parseBody } from '../../../utils/parseBody';
import { getApplicationFormSummary } from '../../../services/ApplicationService';
import { postSection } from '../../../services/SectionService';
import { ValidationError } from 'gap-web-ui';
import SectionNameContent, { getServerSideProps } from './section-name.page';

jest.mock('axios');
jest.mock('../../../utils/parseBody');
jest.mock('../../../services/ApplicationService');
jest.mock('../../../services/SectionService');

const mockedPostSection = jest.mocked(postSection);

const APPLICATION_NAME = 'Test Application Name';
const APPLICATION_ID = 123;

const component = (
  <SectionNameContent
    pageCaption={APPLICATION_NAME}
    backButtonHref="/back"
    formAction="#"
    fieldErrors={[]}
  />
);

describe('Section name page', () => {
  it('Should render a back button', () => {
    render(component);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/apply/back'
    );
  });

  it('Should render the section name page layout output', () => {
    render(component);
    screen.getByTestId('question-page-form');
  });

  it('Should render a page caption with the passed in application name', () => {
    render(component);
    screen.getByText(APPLICATION_NAME);
  });

  it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
    render(component);
    expect(document.title).toBe('Add new section - Manage a grant');
  });

  it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
    render(
      <SectionNameContent
        pageCaption={APPLICATION_NAME}
        backButtonHref="/back"
        formAction="#"
        fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
      />
    );

    expect(document.title).toBe('Error: Add new section - Manage a grant');
  });

  it('Renders text input field for section name', () => {
    render(component);
    screen.getByTestId('text-input-component');
  });
});

describe('getServerSideProps', () => {
  const getContext = (overrides = {}) =>
    merge(
      {
        params: { applicationId: APPLICATION_ID.toLocaleString() } as Record<
          string,
          string
        >,
        req: {
          method: 'GET',
          cookies: { 'gap-test': 'testSessionId' },
        },
        res: { getHeader: () => 'testCSRFToken' },
      } as unknown as GetServerSidePropsContext,
      overrides
    );

  const serviceErrorRedirect = {
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify({
        errorInformation:
          'Something went wrong while trying to create the section.',
        linkAttributes: {
          href: `/build-application/${APPLICATION_ID}/dashboard`,
          linkText: 'Please return',
          linkInformation: ' and try again.',
        },
      })}`,
      statusCode: 302,
    },
  };

  beforeEach(() => {
    (getApplicationFormSummary as jest.Mock).mockResolvedValue({
      applicationName: APPLICATION_NAME,
    });
    process.env.SESSION_COOKIE_NAME = 'gap-test';
  });

  describe('when handling a GET request', () => {
    it('Should return an application name', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageCaption).toStrictEqual(APPLICATION_NAME);
    });

    it('Should redirect to the error service page when fetching the application name fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(serviceErrorRedirect);
    });

    it('Should return a back button href', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.backButtonHref).toStrictEqual(
        `/build-application/${APPLICATION_ID}/dashboard`
      );
    });

    it('Should return an empty list of field errors', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.fieldErrors).toStrictEqual([]);
    });
  });

  describe('when handling a POST request', () => {
    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({
        sectionTitle: 'New Section Title',
      });
      process.env.SESSION_COOKIE_NAME = 'gap-test';
    });

    const getPostContext = (overrides: any = {}) =>
      getContext(
        merge(
          {
            req: { method: 'POST' },
            resolvedUrl: `/build-application/${APPLICATION_ID}/section-name`,
          },
          overrides
        )
      );

    it('Should redirect to the dashboard when posting succeeds', async () => {
      mockedPostSection.mockResolvedValue('testSectionId');

      const result = (await getServerSideProps(
        getPostContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual({
        redirect: {
          destination: `/build-application/${APPLICATION_ID}/testSectionId`,
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page when posting fails (and it is not a validation error)', async () => {
      mockedPostSection.mockRejectedValue('');

      const result = (await getServerSideProps(
        getPostContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(serviceErrorRedirect);
    });

    describe('Validation errors', () => {
      const validationErrors = [
        {
          fieldName: 'sectionTitle',
          errorMessage: 'Please enter a section name',
        },
      ] as ValidationError[];

      beforeEach(() => {
        mockedPostSection.mockRejectedValue({
          response: { data: { fieldErrors: validationErrors } },
        });
      });

      it('Should return a list of field errors when posting fails due to validation errors', async () => {
        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result.props.fieldErrors).toStrictEqual(validationErrors);
      });

      it('Should return an application name when posting fails due to validation errors', async () => {
        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result.props.pageCaption).toStrictEqual(APPLICATION_NAME);
      });

      it('Should return a back button href when posting fails due to validation errors', async () => {
        const result = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.backButtonHref).toStrictEqual(
          `/build-application/${APPLICATION_ID}/dashboard`
        );
      });

      it('Should return a form action that posts to the same page', async () => {
        const result = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.formAction).toStrictEqual(
          process.env.SUB_PATH +
            `/build-application/${APPLICATION_ID}/section-name`
        );
      });
    });
  });
});
