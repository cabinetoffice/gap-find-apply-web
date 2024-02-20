import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { getSummaryFromSession } from '../../../../../services/SessionService';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
import AddWordCount, { getServerSideProps } from './add-word-count.page';
import { postQuestion } from '../../../../../services/QuestionService';
import { getApplicationFormSummary } from '../../../../../services/ApplicationService';
import { parseBody } from '../../../../../utils/parseBody';
import NextGetServerSidePropsResponse from '../../../../../types/NextGetServerSidePropsResponse';
import { getPageProps } from '../../../../../testUtils/unitTestHelpers';
import { getDepartment } from '../../../../../services/SuperAdminService';
import InferProps from '../../../../../types/InferProps';

jest.mock('../../../../../services/SessionService');
jest.mock('../../../../../services/QuestionService');
jest.mock('../../../../../services/ApplicationService');
jest.mock('../../../../../utils/parseBody');

const getMockQuestionSummary = () => ({
  fieldTitle: 'Sample Field Title',
  hintText: 'Sample Hint Text',
  optional: 'false',
  maxWords: 20,
  responseType: ResponseTypeEnum.LongAnswer,
});

const getMockContext = ({ method } = { method: 'POST' }) =>
  ({
    res: { getHeader: () => 'token' },
    params: { applicationId: 'appId', sectionId: 'sectionId' },
    req: { cookies: { sessionId: 'token' }, method },
    query: {},
  } as unknown as GetServerSidePropsContext);

describe('getServerSideProps()', () => {
  beforeEach(() => {
    process.env.SESSION_COOKIE_NAME = 'sessionId';
    (parseBody as jest.Mock).mockResolvedValue(getMockQuestionSummary());
    (getApplicationFormSummary as jest.Mock).mockResolvedValue({
      sections: [
        { sectionId: 'sectionId0', sectionTitle: 'Custom section name 0' },
        { sectionId: 'sectionId', sectionTitle: 'Custom section name' },
      ],
    });
  });

  it('Should NOT attempt to post the question', async () => {
    await getServerSideProps(getMockContext({ method: 'POST' }));
    expect(postQuestion).not.toHaveBeenCalled();
  });

  it('Should redirect to the error service page when posting the question fails', async () => {
    (postQuestion as jest.Mock).mockRejectedValue({});
    const value = await getServerSideProps(getMockContext({ method: 'POST' }));

    expect(value).toStrictEqual({
      redirect: {
        destination:
          '/service-error?serviceErrorProps={"errorInformation":"Something went wrong while trying to load this page.","linkAttributes":{"linkText":"Please return","linkInformation":" and try again."}}',
        statusCode: 302,
      },
    });
  });

  it('should call postQuestion service with a POST request', async () => {
    (getSummaryFromSession as jest.Mock).mockResolvedValueOnce({});
    (postQuestion as jest.Mock).mockResolvedValueOnce(getMockQuestionSummary());

    await getServerSideProps(getMockContext());

    expect(postQuestion).toBeCalledTimes(1);
    expect(postQuestion).toBeCalledWith(
      'token',
      'appId',
      'sectionId',
      expect.objectContaining({
        responseType: ResponseTypeEnum.LongAnswer,
        validation: {
          maxWords: 20,
          mandatory: true,
        },
      })
    );
  });

  it('should return the correct sectiontitle with a GET request', async () => {
    (getSummaryFromSession as jest.Mock).mockResolvedValueOnce(
      getMockQuestionSummary()
    );

    const {
      props: { pageData },
    } = (await getServerSideProps(
      getMockContext({ method: 'GET' })
    )) as NextGetServerSidePropsResponse;

    expect(pageData).toEqual({
      backButtonHref: '/build-application/appId/sectionId/question-type',
      sectionTitle: 'Custom section name',
    });
  });
});

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  fieldErrors: [],
  pageData: {
    backButtonHref: '/some-back-href',
    sectionTitle: 'section-title',
  },
  previousValues: {
    fieldTitle: 'Test 2 Section Field Title',
    hintText: 'Test 2 hint text',
    optional: '',
    maxWords: undefined,
  },
  formAction: '',
  csrfToken: '',
});

describe('Add word count page', () => {
  it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
    render(
      <AddWordCount
        {...getPageProps(getDefaultProps, {
          fieldErrors: [{ fieldName: 'anything', errorMessage: 'Error' }],
        })}
      />
    );

    expect(document.title).toBe('Error: Add a question - Manage a grant');
  });

  it('Renders the question page layout output', () => {
    render(<AddWordCount {...getPageProps(getDefaultProps)} />);

    expect(document.title).toBe('Add a question - Manage a grant');
    screen.getByTestId('question-page-form');
    expect(screen.getByRole('textbox')).toHaveValue('');
    screen.getByRole('button', { name: 'Save and continue' });
  });

  it('Should render a back button with correct link on it', () => {
    render(<AddWordCount {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/apply/some-back-href'
    );
  });

  it('Has a default of the previous value prop when it exists', () => {
    render(
      <AddWordCount
        {...getPageProps(getDefaultProps, {
          previousValues: { maxWords: '303' },
        })}
      />
    );

    expect(screen.getByRole('textbox')).toHaveValue('303');
  });
});
