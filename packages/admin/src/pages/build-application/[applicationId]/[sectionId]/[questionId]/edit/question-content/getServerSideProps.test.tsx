import { getServerSideProps } from './index.page';
import { GetServerSidePropsContext, Redirect } from 'next';
import { getApplicationFormSummary } from '../../../../../../../services/ApplicationService';
import {
  InferServiceMethodResponse,
  Optional,
  ValidationError,
  getContext,
  mockServiceMethod,
} from 'gap-web-ui';
import { parseBody } from '../../../../../../../utils/parseBody';
import {
  getQuestion,
  patchQuestion,
} from '../../../../../../../services/QuestionService';
import ResponseTypeEnum from '../../../../../../../enums/ResponseType';

jest.mock('../../../../../../../utils/parseBody');
jest.mock('../../../../../../../services/ApplicationService');
jest.mock('../../../../../../../services/QuestionService');

const mockedGetApplicationFormSummary = jest.mocked(getApplicationFormSummary);
const mockedGetQuestion = jest.mocked(getQuestion);
const mockedPatchQuestion = jest.mocked(patchQuestion);

const getDefaultAppFormSummary = (): InferServiceMethodResponse<
  typeof getApplicationFormSummary
> => ({
  applicationName: 'Some application name',
  applicationStatus: 'DRAFT',
  audit: {
    created: '2021-08-09T14:00:00.000Z',
    lastPublished: '2021-08-09T14:00:00.000Z',
    lastUpdatedBy: 'some-user',
    lastUpdatedDate: '2021-08-09T14:00:00.000Z',
    version: 1,
  },
  grantApplicationId: 'testApplicationId',
  grantSchemeId: 'some-grant-scheme-id',
  sections: [
    {
      sectionId: 'testSectionId',
      sectionStatus: 'COMPLETE',
      sectionTitle: 'some-section-title',
      questions: [],
    },
  ],
});

const getDefaultQuestion = (): InferServiceMethodResponse<
  typeof getQuestion
> => ({
  fieldTitle: 'Test Section Field Title',
  hintText: 'Test hint text',
  validation: { mandatory: 'true' },
  responseType: ResponseTypeEnum.ShortAnswer,
  questionId: 'testQuestionId',
  adminSummary: '',
  profileField: '',
  fieldPrefix: '',
  questionSuffix: '',
  displayText: '',
});

const expectedGetRedirectObject = {
  redirect: {
    destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to load this page.","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}`,
    statusCode: 302,
  } as Redirect,
};

describe('getServerSideProps', () => {
  beforeEach(() => {
    mockServiceMethod(
      mockedGetApplicationFormSummary,
      getDefaultAppFormSummary
    );

    mockServiceMethod(mockedGetQuestion, getDefaultQuestion);
  });

  const getDefaultContext = (): Optional<GetServerSidePropsContext> => ({
    params: {
      applicationId: 'testApplicationId',
      sectionId: 'testSectionId',
      questionId: 'testQuestionId',
    },
    query: {
      scrollPosition: '0',
    },
  });

  it('Should return a back button href', async () => {
    const value = await getServerSideProps(getContext(getDefaultContext));

    if ('redirect' in value) throw new Error('Expected props');

    expect(value.props.pageData.backButtonHref).toStrictEqual(
      '/build-application/testApplicationId/testSectionId'
    );
  });

  it('back button href should link to dashboard when backTo links there.', async () => {
    const value = await getServerSideProps(
      getContext(getDefaultContext, { query: { backTo: 'dashboard' } })
    );

    if ('redirect' in value) throw new Error('Expected props');

    expect(value.props.pageData.backButtonHref).toStrictEqual(
      '/build-application/testApplicationId/dashboard'
    );
  });

  it('Should return a form action', async () => {
    const value = await getServerSideProps(getContext(getDefaultContext));

    if ('redirect' in value) throw new Error('Expected props');

    expect(value.props.formAction).toStrictEqual(
      process.env.SUB_PATH + '/testResolvedURL'
    );
  });

  it('Should redirect to the service error page when fetching the question data fails', async () => {
    mockedGetQuestion.mockRejectedValue({});

    const value = await getServerSideProps(getContext(getDefaultContext));

    expect(value).toStrictEqual(expectedGetRedirectObject);
  });

  it('Should redirect to the service error page when fetching the section title fails', async () => {
    mockedGetApplicationFormSummary.mockRejectedValue({});

    const value = await getServerSideProps(getContext(getDefaultContext));

    expect(value).toStrictEqual(expectedGetRedirectObject);
  });

  it('Should redirect to question preview page if the application has been published', async () => {
    mockServiceMethod(
      mockedGetApplicationFormSummary,
      getDefaultAppFormSummary,
      { applicationStatus: 'PUBLISHED' }
    );

    const value = await getServerSideProps(getContext(getDefaultContext));

    expect(value).toStrictEqual({
      redirect: {
        destination:
          '/build-application/testApplicationId/testSectionId/testQuestionId/preview',
        statusCode: 302,
      },
    });
  });

  describe('when handling a GET request', () => {
    it('Should NOT attempt to patch the question', async () => {
      await getServerSideProps(getContext(getDefaultContext));
      expect(patchQuestion).not.toHaveBeenCalled();
    });

    it('Should return an empty array of field errors', async () => {
      const value = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in value) throw new Error('Expected props');

      expect(value.props.fieldErrors).toStrictEqual([]);
    });

    it('Should return correct field title using the data retrieved from question entry', async () => {
      const value = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in value) throw new Error('Expected props');

      expect(value.props.pageData.questionData.fieldTitle).toStrictEqual(
        'Test Section Field Title'
      );
    });

    it('Should return correct hint text using the data retrieved from question entry', async () => {
      const value = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in value) throw new Error('Expected props');

      expect(value.props.pageData.questionData.hintText).toStrictEqual(
        'Test hint text'
      );
    });

    it('Should return correct value for optional state question using the data retrieved from question entry', async () => {
      const value = await getServerSideProps(getContext(getDefaultContext));

      if ('redirect' in value) throw new Error('Expected props');

      expect(
        value.props.pageData.questionData.validation.mandatory
      ).toStrictEqual('true');
    });
  });

  describe('when handling a POST request', () => {
    beforeEach(() => {
      (parseBody as jest.Mock).mockResolvedValue({
        fieldTitle: 'Title',
        hintText: 'A hint describing the question',
        optional: 'true',
      });
      mockedPatchQuestion.mockResolvedValue();
    });

    it('Should redirect to the error service page when patching the question fails', async () => {
      (patchQuestion as jest.Mock).mockRejectedValue({});

      const value = await getServerSideProps(
        getContext(getDefaultContext, { req: { method: 'POST' } })
      );

      expect(value).toStrictEqual({
        redirect: {
          destination: `/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to update the question.","linkAttributes":{"href":"/testResolvedURL","linkText":"Please return","linkInformation":" and try again."}}`,
          statusCode: 302,
        },
      });
    });

    it('Should redirect to application dashboard when patching the question succeeds', async () => {
      const value = await getServerSideProps(
        getContext(getDefaultContext, { req: { method: 'POST' } })
      );

      expect(value).toStrictEqual({
        redirect: {
          destination: '/build-application/testApplicationId/testSectionId',
          statusCode: 302,
        },
      });
    });

    it('Should redirect to edit section page when patching the question succeeds (and the user reached this page from edit section)', async () => {
      const value = await getServerSideProps(
        getContext(getDefaultContext, {
          req: { method: 'POST' },
          query: { backTo: 'edit-section' },
        })
      );

      expect(value).toStrictEqual({
        redirect: {
          destination: '/build-application/testApplicationId/testSectionId',
          statusCode: 302,
        },
      });
    });

    describe('Throws validation errors', () => {
      const validationErrors: ValidationError[] = [
        {
          fieldName: 'fieldTitle',
          errorMessage: 'Question title should be greater than 2 characters',
        },
        {
          fieldName: 'hintText',
          errorMessage:
            'Question hint should not be greater than 1000 characters',
        },
      ];

      beforeEach(() => {
        mockedPatchQuestion.mockRejectedValue({
          response: {
            data: { fieldErrors: validationErrors },
          },
        });
      });

      it('Should return a list of field errors when patching a question', async () => {
        const value = await getServerSideProps(
          getContext(getDefaultContext, { req: { method: 'POST' } })
        );

        if ('redirect' in value) throw new Error('Expected props');

        expect(value.props.fieldErrors).toStrictEqual(validationErrors);
      });

      it('Should return a default value of the previously entered field title when patching a question', async () => {
        const value = await getServerSideProps(
          getContext(getDefaultContext, { req: { method: 'POST' } })
        );

        if ('redirect' in value) throw new Error('Expected props');

        expect(value.props.pageData.questionData.fieldTitle).toStrictEqual(
          'Test Section Field Title'
        );
      });

      it('Should return a default value of the previously entered hint text when patching a question', async () => {
        const value = await getServerSideProps(
          getContext(getDefaultContext, { req: { method: 'POST' } })
        );

        if ('redirect' in value) throw new Error('Expected props');

        expect(value.props.pageData.questionData.hintText).toStrictEqual(
          'Test hint text'
        );
      });

      it('Should return a default value of the previously entered optional field when patching a question', async () => {
        const value = await getServerSideProps(
          getContext(getDefaultContext, { req: { method: 'POST' } })
        );

        if ('redirect' in value) throw new Error('Expected props');

        expect(
          value.props.pageData.questionData.validation.mandatory
        ).toStrictEqual('true');
      });
    });
  });
});
