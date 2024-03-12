import { merge } from 'lodash';
import '@testing-library/jest-dom';
import { GetServerSidePropsContext } from 'next';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import { getServerSideProps } from './index.getServerSideProps';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import axios from 'axios';
import {
  addFieldsToSession,
  getSummaryFromSession,
  getValueFromSession,
} from '../../../../../services/SessionService';
import { parseBody } from '../../../../../utils/parseBody';
import { ValidationError } from 'gap-web-ui';
import { getQuestion } from '../../../../../services/QuestionService';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
import * as QuestionService from '../../../../../services/QuestionService';

jest.mock('axios');
jest.mock('../../../../../utils/parseBody');
jest.mock('../../../../../services/SessionService');
jest.mock('../../../../../services/ApplicationService');

describe('getServerSideProps', () => {
  const getContext = (overrides = {}) =>
    merge(
      {
        resolvedUrl: '/build-application/applicationId/sectionId/question-type',
        params: {
          applicationId: 'applicationId',
          sectionId: 'sectionId',
        } as Record<string, string>,
        req: {
          method: 'GET',
          cookies: { session_id: 'test-session-id' },
        },
        res: { getHeader: () => 'testCSRFToken' },
        query: {},
      },
      overrides
    ) as unknown as GetServerSidePropsContext;

  const getServiceErrorRedirect = (errorInformation?: string) => ({
    redirect: {
      destination: `/service-error?serviceErrorProps=${JSON.stringify({
        errorInformation:
          errorInformation ??
          'Something went wrong while trying to create the question.',
        linkAttributes: {
          href: '/build-application/applicationId/dashboard',
          linkText: 'Please return',
          linkInformation: ' and try again.',
        },
      })}`,
      statusCode: 302,
    },
  });

  beforeEach(() => {
    (getApplicationFormSummary as jest.Mock).mockResolvedValue({
      sections: [
        { sectionId: 'sectionId', sectionTitle: 'Custom section name' },
      ],
      audit: {
        version: 1,
      },
    });
    process.env.SESSION_COOKIE_NAME = 'test-session-id';
    process.env.SUB_PATH = '/apply';
  });

  describe('when handling a GET request', () => {
    it('Should return a section name', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageData.sectionName).toStrictEqual(
        'Custom section name'
      );
    });

    it('Should redirect to the error service page when fetching the section name fails', async () => {
      (getApplicationFormSummary as jest.Mock).mockRejectedValue({});

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(
        getServiceErrorRedirect(
          'Something went wrong while trying to load this page.'
        )
      );
    });

    it('Should return a back button href', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageData.backButtonHref).toStrictEqual(
        '/build-application/applicationId/sectionId/question-content'
      );
    });

    it('Should return a form action that posts to the same page', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.formAction).toStrictEqual(
        '/apply/build-application/applicationId/sectionId/question-type'
      );
    });

    it('Should return an empty list of field errors', async () => {
      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.fieldErrors).toStrictEqual([]);
    });

    it('Should not attempt to create the question for a GET request', async () => {
      await getServerSideProps(getContext());

      expect(axios.post).not.toHaveBeenCalled();
    });

    it('Should not attempt to fetch the question summary from the session for a GET request', async () => {
      await getServerSideProps(getContext());

      expect(getSummaryFromSession).not.toHaveBeenCalled();
    });

    it('Should return empty defaultChecked string if no responseType exists in session', async () => {
      (getValueFromSession as jest.Mock).mockResolvedValue(null);

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageData.defaultRadio).toStrictEqual('');
    });

    it('Should return defaultChecked string of Multiple choice if responseType is Dropdown', async () => {
      (getValueFromSession as jest.Mock).mockResolvedValue('Dropdown');

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageData.defaultRadio).toStrictEqual(
        'Multiple choice'
      );
    });

    it('Should return defaultChecked string of Multiple select if responseType is MultipleSelection', async () => {
      (getValueFromSession as jest.Mock).mockResolvedValue('MultipleSelection');

      const result = (await getServerSideProps(
        getContext()
      )) as NextGetServerSidePropsResponse;

      expect(result.props.pageData.defaultRadio).toStrictEqual(
        'Multiple select'
      );
    });
  });

  describe('when handling a POST request', () => {
    const getPostContext = (overrides: any = {}) =>
      getContext(
        merge(
          { req: { method: 'POST', cookies: { session_id: 'ssessionId' } } },
          overrides
        )
      );

    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({
        responseType: 'ShortAnswer',
      });
      (getSummaryFromSession as jest.Mock).mockResolvedValue({
        fieldTitle: 'Field title',
        hintField: 'Hint field',
        displayText: 'Display text',
        mandatory: 'true',
      });
    });

    it('Should redirect to the service error page when fetching from the session fails', async () => {
      (getSummaryFromSession as jest.Mock).mockRejectedValueOnce({});

      const result = (await getServerSideProps(
        getPostContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(getServiceErrorRedirect());
    });

    it('Should redirect to the dashboard when posting succeeds', async () => {
      const result = (await getServerSideProps(
        getPostContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual({
        redirect: {
          destination: '/build-application/applicationId/sectionId',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page when posting fails (and it is not a validation error)', async () => {
      (axios.post as jest.Mock).mockRejectedValue({});

      const result = (await getServerSideProps(
        getPostContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(getServiceErrorRedirect());
    });

    describe('question type with options', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          responseType: 'Dropdown',
        });
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });
      });

      it('Should add responseType to session if options are needed', async () => {
        await getServerSideProps(getPostContext({}));

        expect(addFieldsToSession).toBeCalled();
      });

      it('Should redirect to the question options page.', async () => {
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });

        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/build-application/applicationId/sectionId/question-options?from=question-type',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the error service page when adding to session fails', async () => {
        (addFieldsToSession as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(getServiceErrorRedirect());
      });
    });

    describe('Validation errors', () => {
      const validationErrors = [
        { fieldName: 'name', errorMessage: 'Please enter a name' },
        {
          fieldName: 'description',
          errorMessage: 'Please enter a description',
        },
      ] as ValidationError[];

      beforeEach(() => {
        (axios.post as jest.Mock).mockRejectedValue({
          response: { data: { fieldErrors: validationErrors } },
        });
      });

      it('Should return a list of field errors when posting fails due to validation errors', async () => {
        const result = (await getServerSideProps(
          getPostContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result.props.fieldErrors).toStrictEqual(validationErrors);
      });

      it('Should return a section name', async () => {
        const result = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.pageData.sectionName).toStrictEqual(
          'Custom section name'
        );
      });

      it('Should return a back button href when posting fails due to validation errors', async () => {
        const result = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.pageData.backButtonHref).toStrictEqual(
          '/build-application/applicationId/sectionId/question-content'
        );
      });

      it('Should return a form action that posts to the same page', async () => {
        const result = (await getServerSideProps(
          getPostContext()
        )) as NextGetServerSidePropsResponse;

        expect(result.props.formAction).toStrictEqual(
          '/apply/build-application/applicationId/sectionId/question-type'
        );
      });
    });
  });

  describe('when handling a PATCH request', () => {
    const getPatchContext = (overrides: any = {}) =>
      getContext(
        merge(
          {
            req: { method: 'POST', cookies: { session_id: 'ssessionId' } },
            query: { questionId: 'questionId' },
          },
          overrides
        )
      );

    beforeEach(() => {
      jest.clearAllMocks();
      (parseBody as jest.Mock).mockResolvedValue({
        responseType: 'ShortAnswer',
      });
      (getSummaryFromSession as jest.Mock).mockResolvedValue({
        fieldTitle: 'Field title',
        hintField: 'Hint field',
        displayText: 'Display text',
        mandatory: 'true',
      });
      jest.spyOn(QuestionService, 'getQuestion').mockResolvedValue({
        responseType: ResponseTypeEnum.YesNo,
        questionId: 'questionId',
        profileField: '',
        fieldPrefix: '',
        fieldTitle: '',
        hintText: '',
        adminSummary: '',
        displayText: '',
        questionSuffix: '',
        optional: 'false',
        validation: {},
      });
    });

    it('Should redirect to the service error page when fetching from the session fails', async () => {
      (getSummaryFromSession as jest.Mock).mockRejectedValueOnce({});

      const result = (await getServerSideProps(
        getPatchContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(
        getServiceErrorRedirect(
          'Something went wrong while trying to edit the question.'
        )
      );
    });

    it('Should redirect to question edit page when patching succeeds', async () => {
      const result = (await getServerSideProps(
        getPatchContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual({
        redirect: {
          destination:
            '/build-application/applicationId/sectionId/questionId/edit/question-content',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to the error service page when patching fails (and it is not a validation error)', async () => {
      (axios.patch as jest.Mock).mockRejectedValueOnce({});

      const result = (await getServerSideProps(
        getPatchContext({})
      )) as NextGetServerSidePropsResponse;

      expect(result).toStrictEqual(
        getServiceErrorRedirect(
          'Something went wrong while trying to edit the question.'
        )
      );
    });

    describe('question type with options', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          responseType: 'Dropdown',
        });
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });
      });

      it('Should add responseType to session if options are needed', async () => {
        await getServerSideProps(getPatchContext({}));

        expect(addFieldsToSession).toBeCalled();
      });

      it('Should redirect to the question options page.', async () => {
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });

        const result = (await getServerSideProps(
          getPatchContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/build-application/applicationId/sectionId/questionId/edit/question-options?questionId=questionId&from=question-type',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the error service page when adding to session fails', async () => {
        (addFieldsToSession as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getPatchContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(
          getServiceErrorRedirect(
            'Something went wrong while trying to edit the question.'
          )
        );
      });
    });

    describe('question type with word count', () => {
      beforeEach(() => {
        (parseBody as jest.Mock).mockResolvedValue({
          responseType: 'LongAnswer',
        });
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });
        (getQuestion as jest.Mock).mockResolvedValue({
          responseType: ResponseTypeEnum.YesNo,
        });
      });

      it('Should add responseType to session if word count is needed', async () => {
        await getServerSideProps(getPatchContext({}));

        expect(addFieldsToSession).toBeCalled();
      });

      it('Should redirect to the word count page.', async () => {
        (addFieldsToSession as jest.Mock).mockResolvedValue({
          data: '',
          sessionId: 'mock-session-id',
        });

        const result = (await getServerSideProps(
          getPatchContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual({
          redirect: {
            destination:
              '/build-application/applicationId/sectionId/question-type/add-word-count?questionId=questionId&from=question-type',
            statusCode: 302,
          },
        });
      });

      it('Should redirect to the error service page when adding to session fails', async () => {
        (addFieldsToSession as jest.Mock).mockRejectedValue({});

        const result = (await getServerSideProps(
          getPatchContext({})
        )) as NextGetServerSidePropsResponse;

        expect(result).toStrictEqual(
          getServiceErrorRedirect(
            'Something went wrong while trying to edit the question.'
          )
        );
      });
    });
  });
});
