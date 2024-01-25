import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import {
  ApplicationDetailsInterface,
  getQuestionById,
  getSubmissionById,
  hasSubmissionBeenSubmitted,
  QuestionData,
  QuestionType,
} from '../../../../../../../services/SubmissionService';
import { createMockRouter } from '../../../../../../../testUtils/createMockRouter';
import { getJwtFromCookies } from '../../../../../../../utils/jwt';
import postQuestion from '../../../../../../../utils/postQuestion';
import { routes } from '../../../../../../../utils/routes';
import QuestionPage, {
  getServerSideProps,
  getValidationErrorsFromQuery,
} from './index.page';

jest.mock('../../../../../../../services/SubmissionService');
jest.mock('../../../../../../../utils/postQuestion');
jest.mock('../../../../../../../utils/jwt');
jest.mock('../../../../../../../utils/parseBody');

const context = {
  req: {
    method: 'GET',
    headers: { referer: '/test' },
  },
  res: {
    getHeader: () => 'testCSRFToken',
  },
  params: {
    submissionId: '12345678',
    sectionId: '87654321',
    questionId: '00000000',
    grantName: 'Test Grant Application',
  },
} as unknown as GetServerSidePropsContext;
const { submissionId, sectionId, questionId, grantName } = context.params;
const shortAnswer: QuestionType = {
  questionId: 'APPLICANT_ORG_NAME',
  profileField: 'ORG_NAME',
  fieldTitle: 'Enter the name of your organisation',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'ShortAnswer',
  validation: {
    mandatory: true,
    minLength: 5,
    maxLength: 100,
  },
};

const numeric: QuestionType = {
  questionId: 'APPLICANT_ORG_NAME',
  profileField: 'ORG_NAME',
  fieldTitle: 'Enter the amount',
  hintText:
    'This is the official name of your organisation. It could be the name that is registered with Companies House or the Charities Commission',
  responseType: 'Numeric',
  validation: {
    mandatory: true,
    greaterThanZero: true,
  },
};
const longAnswer: QuestionType = {
  questionId: 'CUSTOM_QUESTION_1',
  fieldTitle:
    'Description of the project, please include information regarding public accessibility (see GOV.UK guidance for a definition of public access) to the newly planted trees',
  responseType: 'LongAnswer',
  validation: {
    mandatory: true,
    minLength: 100,
    maxLength: 2000,
    minWords: 20,
    maxWords: 500,
  },
};
const uploadFile: QuestionType = {
  attachmentId: 'attachmentId',
  questionId: 'UPLOAD',
  fieldTitle: 'document upload question title',
  hintText: 'document upload question description',
  responseType: 'SingleFileUpload',
  validation: {
    mandatory: true,
    minLength: null,
    maxLength: null,
    minWords: null,
    maxWords: null,
    greaterThanZero: null,
    maxFileSizeMB: 300,
    allowedTypes: ['DOC', 'DOCX', 'ODT', 'PDF', 'XLS', 'XLSX', 'ZIP'],
  },
};
const address: QuestionType = {
  questionId: 'APPLICANT_ORG_ADDRESS',
  profileField: 'ORG_ADDRESS',
  fieldTitle: "Enter your organisation''s address",
  responseType: 'AddressInput',
  validation: { mandatory: true },
};

const date: QuestionType = {
  questionId: 'CUSTOM_QUESTION_4',
  fieldTitle: 'Please provide the date of your last awarded grant',
  responseType: 'Date',
  validation: { mandatory: true },
};

const selectInput: QuestionType = {
  questionId: 'APPLICANT_TYPE',
  profileField: 'ORG_TYPE',
  fieldTitle: 'Choose your organisation type',
  hintText: 'Choose the option that best describes your organisation',
  responseType: 'Dropdown',
  validation: { mandatory: true },
  options: [
    'Limited company',
    'Non-limited company',
    'Registered charity',
    'Unregistered charity',
    'Other',
  ],
};
const yesNo: QuestionType = {
  questionId: 'APPLICANT_ORG_COMPANIES_HOUSE',
  profileField: 'ORG_COMPANIES_HOUSE',
  fieldTitle: 'Does your organisation have a Companies House number?',
  hintText:
    'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.',
  responseType: 'YesNo',
  validation: { mandatory: true },
};

const eligibility = {
  questionId: 'ELIGIBILITY',
  profileField: null,
  fieldTitle: 'Eligibility Statement',
  displayText:
    'Some admin supplied text describing what it means to be eligible to apply for this grant',
  hintText: null,
  questionSuffix: 'Does your organisation meet the eligibility criteria?',
  fieldPrefix: null,
  responseType: 'YesNo',
  validation: {
    mandatory: true,
  },
  options: null,
  response: null,
  multiResponse: null,
};

const multipleSelection: QuestionType = {
  questionId: 'APPLICANT_ORG_CHARITY_COMMISSION_NUMBER',
  profileField: 'ORG_CHARITY_COMMISSION_NUMBER',
  fieldTitle: 'What type is your company',
  hintText:
    'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.',
  responseType: 'MultipleSelection',
  validation: { mandatory: true },
  options: [
    'Limited company',
    'Non-limited company',
    'Registered charity',
    'Unregistered charity',
    'Other',
  ],
};
const propsWithNoPreviousNavigation: QuestionData = {
  grantSchemeId: '111111111',
  grantApplicationId: '222222222',
  grantSubmissionId: '333333333',
  sectionId: 'ESSENTIAL',
  sectionTitle: 'Essential Information',
  question: shortAnswer,
  previousNavigation: {
    sectionId: 'ESSENTIAL',
    questionId: '',
  },
  nextNavigation: {
    sectionId: 'ESSENTIAL',
    questionId: 'APPLICANT_TYPE',
  },
};

const props: QuestionData = {
  ...propsWithNoPreviousNavigation,
  previousNavigation: {
    sectionId: 'ESSENTIAL',
    questionId: 'APPLICANT_ORG_ADDRESS',
  },
};

const submission: ApplicationDetailsInterface = {
  grantSchemeId: '1',
  grantApplicationId: '1',
  grantSubmissionId: '3a6cfe2d-bf58-440d-9e07-3579c7dcf205',
  applicationName: 'Test Grant Application',
  submissionStatus: 'IN_PROGRESS',
  sections: [],
};

describe('getServerSideProps', () => {
  describe('non POST scenarios', () => {
    it('should return questionData and grantName with no error', async () => {
      (getQuestionById as jest.Mock).mockReturnValue(props);
      (getSubmissionById as jest.Mock).mockReturnValue(submission);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');

      const response = await getServerSideProps(context);

      expect(response).toEqual({
        props: {
          csrfToken: 'testCSRFToken',
          questionData: props,
          grantName: grantName,
          isRefererCheckYourAnswerScreen: false,
          queryParams: '',
        },
      });
      expect(getQuestionById).toHaveBeenCalled();
      expect(getQuestionById).toHaveBeenCalledWith(
        submissionId,
        sectionId,
        questionId,
        'testJwt'
      );
      expect(getSubmissionById).toHaveBeenCalled();
      expect(getSubmissionById).toHaveBeenCalledWith(
        props.grantSubmissionId,
        'testJwt'
      );
    });
    it('should redirect if application has been submitted', async () => {
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(true);

      const response = await getServerSideProps(context);

      expect(response).toEqual({
        redirect: {
          destination: `/applications`,
          permanent: false,
        },
      });
    });
    it('should pass errors present in queryParams', async () => {
      (getQuestionById as jest.Mock).mockReturnValue(props);
      (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (getSubmissionById as jest.Mock).mockReturnValue(submission);
      const context = {
        req: { method: 'GET' },
        res: {
          getHeader: () => 'testCSRFToken',
        },
        params: {
          submissionId: '12345678',
          sectionId: '87654321',
          questionId: '00000000',
          grantName: 'Test Grant Application',
          queryParams:
            'errors%5B%5D=%7B%22fieldName%22%3A%22questionId%22%2C%20%22errorMessage%22%3A%22error%22%7D',
        },
        query: {
          'errors[]': '{"fieldName":"questionId", "errorMessage":"error"}',
        },
      } as unknown as GetServerSidePropsContext;
      const response = await getServerSideProps(context);
      expect(response).toEqual({
        props: {
          csrfToken: 'testCSRFToken',
          questionData: {
            ...props,
            error: [{ fieldName: 'questionId', errorMessage: 'error' }],
            temporaryErrorInputValue: [],
          },
          grantName: grantName,
          isRefererCheckYourAnswerScreen: false,
          queryParams:
            'errors%5B%5D=%7B%22fieldName%22%3A%22questionId%22%2C%20%22errorMessage%22%3A%22error%22%7D',
        },
      });
      expect(getQuestionById).toHaveBeenCalled();
      expect(getQuestionById).toHaveBeenCalledWith(
        submissionId,
        sectionId,
        questionId,
        'testJwt'
      );
    });
  });
  describe('POST scenarios', () => {
    it('should return questionData with no error', async () => {
      (getQuestionById as jest.Mock).mockReturnValue(props);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      (hasSubmissionBeenSubmitted as jest.Mock).mockReturnValue(false);
      const postContext = {
        req: { method: 'POST' },
        params: {
          submissionId: '12345678',
          sectionId: '87654321',
          questionId: '00000000',
        },
      } as unknown as GetServerSidePropsContext;
      const mockedResponse = {
        redirect: {
          destination: routes.submissions.sections('12345678'),
          statusCode: 302,
        },
      };
      (postQuestion as jest.Mock).mockReturnValue(mockedResponse);
      const response = await getServerSideProps(postContext);

      expect(response).toEqual(mockedResponse);
      expect(getQuestionById).toHaveBeenCalled();
      expect(getQuestionById).toHaveBeenCalledWith(
        submissionId,
        sectionId,
        questionId,
        'testJwt'
      );
      expect(postQuestion).toHaveBeenCalled();
    });

    it('should return questionData with error', async () => {
      (getQuestionById as jest.Mock).mockReturnValue(props);
      (getJwtFromCookies as jest.Mock).mockReturnValue('testJwt');
      const postContext = {
        req: {
          method: 'POST',
          headers: { referer: '/test' },
        },
        res: {
          getHeader: () => 'testCSRFToken',
        },
        params: {
          submissionId: '12345678',
          sectionId: '87654321',
          questionId: 'questionIdTest',
          grantName: grantName,
          queryParams: '',
        },
      } as unknown as GetServerSidePropsContext;
      const fieldErrors = [
        { fieldName: 'questionIdTest', errorValue: 'Something wrong' },
      ];
      const mockedResponse = {
        body: { questionIdTest: 'testValue' },
        values: ['testValue'],
        fieldErrors,
        isRefererCheckYourAnswerScreen: false,
      };
      (postQuestion as jest.Mock).mockReturnValue(mockedResponse);
      const response = await getServerSideProps(postContext);

      expect(response).toEqual({
        props: {
          csrfToken: 'testCSRFToken',
          questionData: {
            ...props,
            error: fieldErrors,
            temporaryErrorInputValue: ['testValue'],
          },
          grantName,
          isRefererCheckYourAnswerScreen: false,
          queryParams: '',
        },
      });
      expect(getQuestionById).toHaveBeenCalled();
      expect(getQuestionById).toHaveBeenCalledWith(
        submissionId,
        sectionId,
        'questionIdTest',
        'testJwt'
      );
      expect(postQuestion).toHaveBeenCalled();
    });
  });
});
describe('QuestionPage', () => {
  describe('Form Buttons', () => {
    test('should render the save and continue and save and exit button when isRefererCheckYourAnswerScreen is false', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={props}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      expect(
        screen.getByRole('button', { name: 'Save and continue' })
      ).toBeDefined();
      expect(
        screen.getByRole('button', { name: 'Save and exit' })
      ).toBeDefined();
    });
    test('should render the save and continue and cancel button when isRefererCheckYourAnswerScreen is true', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={propsWithNoPreviousNavigation}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={true}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByRole('button', { name: 'Save and continue' });
      screen.getByRole('button', { name: 'Cancel' });
    });
  });

  describe('Back Button', () => {
    it('should render', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={props}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      screen.getByRole('link', { name: 'Back' });
    });

    it('should go to PreviousPage if exist', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={props}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      const backBtn = screen.getByRole('link', { name: 'Back' });
      expect(backBtn).toHaveAttribute(
        'href',
        routes.submissions.question(
          props.grantSubmissionId,
          props.sectionId,
          props.previousNavigation.questionId
        )
      );
    });
    it('should go to CheckYourAnswerPage if the referer is CheckYourAnswerPage', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={props}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={true}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      const backBtn = screen.getByRole('link', { name: 'Back' });
      expect(backBtn).toHaveAttribute(
        'href',
        routes.submissions.section(props.grantSubmissionId, props.sectionId)
      );
    });

    it('should go to sectionList if previousNavigation questionId has no value   ', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={propsWithNoPreviousNavigation}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const backBtn = screen.getByRole('link', { name: 'Back' });
      expect(backBtn).toHaveAttribute(
        'href',
        routes.submissions.sections(
          propsWithNoPreviousNavigation.grantSubmissionId
        )
      );
    });
  });

  describe('ShortAnswer questionType', () => {
    test('it should render the correct component - ShortAnswer__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={propsWithNoPreviousNavigation}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByTestId('text-input-component');
      const input = screen.getByRole('textbox', {
        name: 'Enter the name of your organisation',
      });
      expect(input).toHaveValue('');
    });

    test('it should render the correct component - ShortAnswer__with response', () => {
      propsWithNoPreviousNavigation.question.response = 'response';
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={propsWithNoPreviousNavigation}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const input = screen.getByRole('textbox', {
        name: 'Enter the name of your organisation',
      });
      expect(input).toHaveValue('response');
    });

    test('it should render the correct component - ShortAnswer__with error', () => {
      propsWithNoPreviousNavigation.question.response = 'response';
      propsWithNoPreviousNavigation.error = [
        {
          fieldName: propsWithNoPreviousNavigation.question.questionId,
          errorMessage: 'Error',
        },
      ];
      propsWithNoPreviousNavigation.temporaryErrorInputValue = ['TestValue'];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={propsWithNoPreviousNavigation}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const input = screen.getByRole('textbox', {
        name: 'Enter the name of your organisation',
      });
      expect(input).toHaveValue('TestValue');
    });

    test("it should render '(optional)' on an optional question - ShortAnswer", () => {
      const shortAnswerOptional = merge(propsWithNoPreviousNavigation, {
        question: merge(shortAnswer, { validation: 'mandatory' }),
      });
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={shortAnswerOptional}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByLabelText('Enter the name of your organisation (optional)');
    });

    test("it should render '(optional)' only once if optional question already contains '(optional)' - ShortAnswer", () => {
      const shortAnswerOptional = merge(propsWithNoPreviousNavigation, {
        question: merge(
          merge(shortAnswer, { fieldTitle: 'New question title (optional)' }),
          { validation: 'mandatory' }
        ),
      });
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={shortAnswerOptional}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByLabelText('New question title (optional)');
    });
  });

  describe('LongAnswer questionType', () => {
    const longAnswerProps = JSON.parse(JSON.stringify(props));
    longAnswerProps.question = longAnswer;
    const lorem =
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati atque sequi tenetur officia rem aspernatur commodi, nisi rerum necessitatibus aliquam?';
    test('it should render the correct component - LongAnswer__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={longAnswerProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue('');
    });

    test('it should render the correct component - LongAnswer__with response', () => {
      longAnswerProps.question.response = lorem;
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={longAnswerProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue(lorem);
    });

    test('it should render the correct component - LongAnswer__with error', () => {
      longAnswerProps.error = [
        {
          fieldName: longAnswerProps.question.questionId,
          errorMessage: 'Error',
        },
      ];
      longAnswerProps.temporaryErrorInputValue = ['TestValue'];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={longAnswerProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue('TestValue');
    });
  });
  describe('Address questionType', () => {
    const addressProps = JSON.parse(JSON.stringify(props));
    addressProps.question = address;
    test('it should render the correct component - Address__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={addressProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const line1 = screen.getByRole('textbox', { name: 'Address line 1' });
      const line2 = screen.getByRole('textbox', {
        name: 'Address line 2 (optional)',
      });
      const town = screen.getByRole('textbox', { name: 'Town or City' });
      const country = screen.getByRole('textbox', {
        name: 'County (optional)',
      });
      const postcode = screen.getByRole('textbox', { name: 'Postcode' });
      expect(line1).toHaveValue('');
      expect(line2).toHaveValue('');
      expect(town).toHaveValue('');
      expect(country).toHaveValue('');
      expect(postcode).toHaveValue('');
    });
    test('it should render the correct component - Address__with response', () => {
      addressProps.question.multiResponse = [
        'line1',
        'line2',
        'town',
        '',
        'postcode',
      ];
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={addressProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const line1 = screen.getByRole('textbox', { name: 'Address line 1' });
      const line2 = screen.getByRole('textbox', {
        name: 'Address line 2 (optional)',
      });
      const town = screen.getByRole('textbox', { name: 'Town or City' });
      const country = screen.getByRole('textbox', {
        name: 'County (optional)',
      });
      const postcode = screen.getByRole('textbox', { name: 'Postcode' });
      expect(line1).toHaveValue('line1');
      expect(line2).toHaveValue('line2');
      expect(town).toHaveValue('town');
      expect(country).toHaveValue('');
      expect(postcode).toHaveValue('postcode');
    });

    test('it should render the correct component - Address__with error', () => {
      addressProps.error = [
        {
          fieldName: addressProps.question.questionId,
          errorMessage: 'Error',
        },
      ];
      addressProps.temporaryErrorInputValue = ['TestValue', '', '', '', ''];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={addressProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const line1 = screen.getByRole('textbox', { name: 'Address line 1' });
      const line2 = screen.getByRole('textbox', {
        name: 'Address line 2 (optional)',
      });
      const town = screen.getByRole('textbox', { name: 'Town or City' });
      const country = screen.getByRole('textbox', {
        name: 'County (optional)',
      });
      const postcode = screen.getByRole('textbox', { name: 'Postcode' });
      expect(line1).toHaveValue('TestValue');
      expect(line2).toHaveValue('');
      expect(town).toHaveValue('');
      expect(country).toHaveValue('');
      expect(postcode).toHaveValue('');
    });
  });
  describe('Date questionType', () => {
    const dateProps = JSON.parse(JSON.stringify(props));
    dateProps.question = date;
    test('it should render the correct component - Date__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={dateProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      const day = screen.getByRole('textbox', { name: 'Day' });
      const month = screen.getByRole('textbox', { name: 'Month' });
      const year = screen.getByRole('textbox', { name: 'Year' });
      expect(day).toHaveValue('');
      expect(month).toHaveValue('');
      expect(year).toHaveValue('');
    });

    test('it should render the correct component - Date__with response', () => {
      dateProps.question.multiResponse = ['10', '12', '2000'];
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={dateProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const day = screen.getByRole('textbox', { name: 'Day' });
      const month = screen.getByRole('textbox', { name: 'Month' });
      const year = screen.getByRole('textbox', { name: 'Year' });
      expect(day).toHaveValue('10');
      expect(month).toHaveValue('12');
      expect(year).toHaveValue('2000');
    });

    test('it should render the correct component - Date__with error', () => {
      dateProps.error = [
        {
          fieldName: dateProps.question.questionId,
          errorMessage: 'Error',
        },
      ];
      dateProps.temporaryErrorInputValue = ['10', '', ''];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={dateProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const day = screen.getByRole('textbox', { name: 'Day' });
      const month = screen.getByRole('textbox', { name: 'Month' });
      const year = screen.getByRole('textbox', { name: 'Year' });
      expect(day).toHaveValue('10');
      expect(month).toHaveValue('');
      expect(year).toHaveValue('');
    });
  });
  describe('SelectInput questionType', () => {
    const selectInputProps = JSON.parse(JSON.stringify(props));
    selectInputProps.question = selectInput;
    test('it should render the correct component - SelectInput__no response ', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={selectInputProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const select = screen.getByRole('combobox', {
        name: 'Choose your organisation type',
      });
      expect(select).toHaveValue('');
    });

    test('it should render the correct component - SelectInput__with response', () => {
      selectInputProps.question.response = 'Limited Company';
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={selectInputProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const select = screen.getByRole('combobox', {
        name: 'Choose your organisation type',
      });

      expect(select).toHaveValue('Limited Company');
    });
  });
  describe('YesNo questionType', () => {
    const yesNoProps = JSON.parse(JSON.stringify(props));
    yesNoProps.question = yesNo;
    test('it should render the correct component - YesNo__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={yesNoProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const yes = screen.getByRole('radio', { name: 'Yes' });
      const no = screen.getByRole('radio', { name: 'No' });
      expect(yes).not.toHaveAttribute('checked');
      expect(no).not.toHaveAttribute('checked');
    });
    test('it should render the correct component - YesNo__with response', () => {
      yesNoProps.question.response = 'Yes';
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={yesNoProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const yes = screen.getByRole('radio', { name: 'Yes' });
      const no = screen.getByRole('radio', { name: 'No' });

      expect(yes).toHaveAttribute('checked');
      expect(no).not.toHaveAttribute('checked');
    });
  });
  describe('MultipleSelection questionType', () => {
    const multipleSelectionProps = JSON.parse(JSON.stringify(props));
    multipleSelectionProps.question = multipleSelection;

    test('it should render the correct component - Multiple Selection__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={multipleSelectionProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      screen.getByRole('group', {
        name: 'What type is your company',
      });
      const checkBoxes = screen.getAllByRole('checkbox');
      expect(checkBoxes).toHaveLength(5);
      expect(checkBoxes[0]).not.toHaveAttribute('checked');
      expect(checkBoxes[1]).not.toHaveAttribute('checked');
      expect(checkBoxes[2]).not.toHaveAttribute('checked');
      expect(checkBoxes[3]).not.toHaveAttribute('checked');
      expect(checkBoxes[4]).not.toHaveAttribute('checked');
    });

    test('it should render the correct component - MultipleSelection__with response', () => {
      multipleSelectionProps.question.multiResponse = [
        'Limited company',
        'Non-limited company',
      ];
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={multipleSelectionProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const checkBoxes = screen.getAllByRole('checkbox');
      expect(checkBoxes).toHaveLength(5);
      expect(checkBoxes[0]).toHaveAttribute('checked');
      expect(checkBoxes[1]).toHaveAttribute('checked');
      expect(checkBoxes[2]).not.toHaveAttribute('checked');
      expect(checkBoxes[3]).not.toHaveAttribute('checked');
      expect(checkBoxes[4]).not.toHaveAttribute('checked');
    });
  });
  describe('Eligibility questionType', () => {
    const eligibilityProps = JSON.parse(JSON.stringify(props));

    test('it should render the eligibility page correctly - YesNo__no response', () => {
      eligibilityProps.question = eligibility;
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={eligibilityProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );

      expect(
        screen.getByRole('heading', {
          name: /eligibility criteria for test grant application/i,
        })
      ).toHaveClass('govuk-heading-s');
      expect(
        screen.getByText(
          /some admin supplied text describing what it means to be eligible to apply for this grant/i
        )
      ).toBeDefined();
      expect(screen.getByRole('radio', { name: 'Yes' })).not.toHaveAttribute(
        'checked'
      );
      expect(screen.getByRole('radio', { name: 'No' })).not.toHaveAttribute(
        'checked'
      );
    });
  });
  describe('Numeric questionType', () => {
    const numericProps = JSON.parse(JSON.stringify(props));
    numericProps.question = numeric;
    test('it should render the correct component - Numeric__no response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={numericProps}
            grantName="grant name"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox', { name: 'Enter the amount' });
      expect(textbox).toHaveValue('');
    });

    test('it should render the correct component - Numeric__with response', () => {
      numericProps.question.response = '1234';
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={numericProps}
            grantName="grant name"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue('1234');
    });

    test('it should render the correct component - Numeric__with error', () => {
      numericProps.error = [
        {
          fieldName: numericProps.question.questionId,
          errorMessage: 'Error',
        },
      ];
      numericProps.temporaryErrorInputValue = ['TestValue'];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={numericProps}
            grantName="grant name"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      const textbox = screen.getByRole('textbox');
      expect(textbox).toHaveValue('TestValue');
    });
  });

  describe('SingleFileUpload questionType', () => {
    const uploadProps = JSON.parse(JSON.stringify(props));
    uploadProps.question = uploadFile;

    test('it should render the correct component - SingleFileUpload response', () => {
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={uploadProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByTestId('uploadFormDiv');
      screen.getByTestId('pre-upload-hidden-input');
    });

    test('it should render the correct component - SingleFileUpload__with response', () => {
      uploadProps.question.response = 'test123.zip';
      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={uploadProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByText(/uploaded file/i);
      const removeButton = screen.getByRole('link', {
        name: 'Remove File test123.zip',
      });
      const form = screen.getByTestId('question-page-form');
      expect(removeButton).toHaveAttribute(
        'href',
        '/api/routes/submissions/333333333/sections/ESSENTIAL/questions/UPLOAD/attachments/attachmentId/remove'
      );
      expect(form).toHaveAttribute(
        'action',
        '/api/routes/submissions/333333333/sections/ESSENTIAL/questions/UPLOAD/upload-file'
      );
      expect(form).toHaveAttribute('encType', 'multipart/form-data');
    });

    test('it should render the correct component - SingleFileUpload__with error', () => {
      uploadProps.error = [
        {
          fieldName: uploadProps.question.questionId,
          errorMessage: 'Error',
        },
      ];
      uploadProps.temporaryErrorInputValue = [];

      render(
        <RouterContext.Provider
          value={createMockRouter({
            pathname: `/submissions/${submissionId}/sections/${sectionId}/questions/${questionId}`,
          })}
        >
          <QuestionPage
            questionData={uploadProps}
            grantName="Test Grant Application"
            csrfToken="testCSRFToken"
            isRefererCheckYourAnswerScreen={false}
            queryParams={''}
          />
        </RouterContext.Provider>
      );
      screen.getByRole('link', {
        name: /error/i,
      });
      screen.getByTestId('error-message-test-id');
    });
  });
});

describe('getValidationErrorsFromQuery', () => {
  test('should return correct Array one object', () => {
    const errors = '{"name":"John", "age":30, "city":"New York"}';
    const result = getValidationErrorsFromQuery(errors);
    const expectedResult = [{ age: 30, city: 'New York', name: 'John' }];
    expect(result).toStrictEqual(expectedResult);
  });

  test('should return correct Array one object', () => {
    const errors = [
      '{"name":"John", "age":30, "city":"New York"}',
      '{"name":"Ben", "age":20, "city":"Glasgow"}',
    ];
    const result = getValidationErrorsFromQuery(errors);
    const expectedResult = [
      { age: 30, city: 'New York', name: 'John' },
      { age: 20, city: 'Glasgow', name: 'Ben' },
    ];
    expect(result).toStrictEqual(expectedResult);
  });
});
