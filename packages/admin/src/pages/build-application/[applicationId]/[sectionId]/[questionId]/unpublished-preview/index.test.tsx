import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import UnpublishedPreviewQuestion, { getServerSideProps } from './index.page';
import { ApplicationFormQuestion } from '../../../../../../types/ApplicationForm';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';
import { getApplicationFormSection } from '../../../../../../services/ApplicationService';
import { getQuestion } from '../../../../../../services/QuestionService';
import { GetServerSidePropsContext } from 'next';

import { AxiosError } from 'axios';

jest.mock('../../../../../../services/ApplicationService');
jest.mock('../../../../../../services/QuestionService');

const shortAnswerQ = {
  questionId: 'shortAnswer',
  fieldTitle: 'Question 1 - short',
  responseType: ResponseTypeEnum.ShortAnswer,
  validation: {},
};
const longAnswerQ: ApplicationFormQuestion = {
  questionId: 'longAnswer',
  fieldTitle: 'Question 2 - long',
  hintText: 'long answer question',
  responseType: 'LongAnswer',
  validation: {},
};
const yesNoQ: ApplicationFormQuestion = {
  questionId: 'yesNo',
  fieldTitle: 'Question 3 - Yes/No',
  hintText: 'Yes/No question',
  responseType: 'YesNo',
  validation: {},
};
const multipleChoiceQ: ApplicationFormQuestion = {
  questionId: 'multiChoice',
  fieldTitle: 'Question 4 - Multiple Choice',
  hintText: 'Multiple choice question',
  responseType: 'Dropdown',
  options: ['One', 'Two', 'Three'],
  validation: {},
};
const multipleSelectQ: ApplicationFormQuestion = {
  questionId: 'multiSelect',
  fieldTitle: 'Question 5 - Multiple Select',
  hintText: 'Multiple select question',
  responseType: 'MultipleSelection',
  options: ['One', 'Two', 'Three'],
  validation: {},
};
const docUploadQ: ApplicationFormQuestion = {
  questionId: '0c92d26f-d2c6-4ae3-8cfb-b244ee579153',
  fieldTitle: 'Question 6 - Document Upload',
  hintText: 'Document upload question',
  responseType: 'SingleFileUpload',
  validation: {},
};
const dateSelectQ: ApplicationFormQuestion = {
  questionId: '8466844a-25ff-475e-aa2f-fe69ef747add',
  fieldTitle: 'Question 7 - Date ',
  hintText: 'Date selection question',
  responseType: 'Date',
  validation: {},
};
const addressInputQ: ApplicationFormQuestion = {
  questionId: 'orgAddress',
  profileField: 'ORG_ADDRESS',
  fieldTitle: "Enter your organisation's address",
  responseType: 'AddressInput',
  validation: {},
};
const fundAmountQ: ApplicationFormQuestion = {
  questionId: 'fundingAmount',
  fieldPrefix: '£',
  fieldTitle: 'How much does your organisation require as a grant?',
  hintText: 'Please enter whole pounds only',
  responseType: 'Numeric',
  validation: {},
};

const mockCustomSection = {
  sectionId: 'mockCustomSection',
  sectionTitle: 'Test section',
  questions: [
    shortAnswerQ,
    longAnswerQ,
    yesNoQ,
    multipleChoiceQ,
    multipleSelectQ,
    docUploadQ,
    dateSelectQ,
    addressInputQ,
    fundAmountQ,
  ] as ApplicationFormQuestion[],
};

const mockApplicationId = '1';
const mockNextHref = (nextQuestionId: string) => {
  return nextQuestionId
    ? `/build-application/${mockApplicationId}/${mockCustomSection.sectionId}/${nextQuestionId}/unpublished-preview`
    : null;
};

const getQuestionProps = (questionIndex: number) => {
  return {
    question: mockCustomSection.questions[questionIndex],
    pageData: {
      sectionId: mockCustomSection.sectionId,
      questionId: mockCustomSection.questions[questionIndex].questionId,
    },
    backHref: `/build-application/${mockApplicationId}/preview`,
    nextPreviewHref: mockNextHref(
      mockCustomSection.questions[questionIndex + 1]?.questionId
    ),
  };
};

//Buttons that (possibly) appear on the page
const previewText = screen.findByText('Question preview');
const previewNext = screen.findByText('Preview next question');
const backToOverview = screen.findByText('Back to overview');
const backButton = screen.findByText('Back');
describe('UnpublishedPreviewQuestion component', () => {
  describe('Rendering of buttons and text', () => {
    it('Should render a meta title', () => {
      render(<UnpublishedPreviewQuestion {...getQuestionProps(0)} />);
      expect(document.title).toBe('Preview a question - Manage a grant');
    });

    it('Should render "Question preview" copy above question title', () => {
      render(<UnpublishedPreviewQuestion {...getQuestionProps(0)} />);
      expect(previewText).toBeInTheDocument;
      expect(previewText).toBeVisible;
    });

    it('Should render both buttons when there is a next question', () => {
      render(<UnpublishedPreviewQuestion {...getQuestionProps(0)} />);
      const buttons: HTMLElement[] = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      expect(previewNext).toBeInTheDocument;
      expect(previewNext).toBeVisible;
      expect(backToOverview).toBeInTheDocument;
      expect(backToOverview).toBeVisible;
    });

    it('Should only render "Back to overview" button when there is not a question in the section', () => {
      //passing in the last question of the section
      render(<UnpublishedPreviewQuestion {...getQuestionProps(8)} />);
      const buttons: HTMLElement[] = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
      expect(previewNext).not.toBeInTheDocument;
      expect(previewNext).not.toBeVisible;
      expect(backToOverview).toBeInTheDocument;
      expect(backToOverview).toBeVisible;
    });
  });

  describe('Assert whether the question is disabled or not', () => {
    //given array [QUESTION_INDEX, ROLE, DISABLED_EXPECTED]
    const questionRoleTestData = [
      { index: 0, role: 'textbox', disabled: true },
      { index: 1, role: 'textbox', disabled: true },
      { index: 2, role: 'radio', disabled: false },
      { index: 3, role: 'checkbox', disabled: false },
      { index: 4, role: 'group', disabled: false },
      { index: 5, role: 'input', disabled: true },
      { index: 6, role: 'input', disabled: true },
      { index: 8, role: 'textbox', disabled: true },
    ];
    it.each(questionRoleTestData)(
      `for question index $index with role $role, disabled should be $disabled`,
      ({ index, role, disabled }) => {
        render(<UnpublishedPreviewQuestion {...getQuestionProps(index)} />);
        const questionInput = screen.findByRole(role);
        if (disabled) {
          expect(questionInput).toBeDisabled;
        } else {
          expect(questionInput).not.toBeDisabled;
        }
      }
    );
  });

  it('should render AddressInput correctly', () => {
    render(<UnpublishedPreviewQuestion {...getQuestionProps(7)} />);
    const textInputs = screen.getAllByRole('textbox');
    expect(textInputs).toHaveLength(5);
    expect(textInputs).toBeDisabled;
  });
});

describe('getServerSideProps for unpublished-preview index page', () => {
  const backHref = `/build-application/${mockApplicationId}/preview`;
  const axiosError = { response: { data: { code: 500 } } } as AxiosError;

  beforeEach(() => {
    (getApplicationFormSection as jest.Mock).mockResolvedValue(
      mockCustomSection
    );
    (getQuestion as jest.Mock).mockResolvedValue(
      mockCustomSection.questions[0]
    );
    process.env.SESSION_COOKIE_NAME = 'gap-test';
  });

  const getContext = (overrides: any = {}) =>
    merge(
      {
        params: {
          applicationId: mockApplicationId,
          sectionId: mockCustomSection.sectionId,
          questionId: mockCustomSection.questions[0].questionId,
        } as any,
        req: {
          method: 'GET',
          cookies: { 'gap-test': 'testSessionId' },
        } as any,
      } as GetServerSidePropsContext,
      overrides
    );

  describe('Fetching question data', () => {
    describe('Service call to get the current section', () => {
      it('should fetch the relevant section', async () => {
        await getServerSideProps(getContext());
        expect(getApplicationFormSection).toHaveBeenCalledTimes(1);
        expect(getApplicationFormSection).toHaveBeenCalledWith(
          '1',
          'mockCustomSection',
          'testSessionId'
        );
      });

      it('should error if the SECTION service call is rejected - GENERIC ERROR (try{} catch())', async () => {
        (getApplicationFormSection as jest.Mock).mockRejectedValue(axiosError);
        const response = await getServerSideProps(getContext());
        console.log(response);
        expect(response).toStrictEqual({
          redirect: {
            destination:
              '/error-page/code/500?href=/build-application/1/preview',
            statusCode: 302,
          },
        });
      });

      it('should error if the SECTION service call returns null - SPECIFIC ERROR', async () => {
        (getApplicationFormSection as jest.Mock).mockResolvedValue(null);
        const response = await getServerSideProps(getContext());
        console.log(response);
        expect(response).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Could not find the section, please make sure the URL is correct","linkAttributes":{"href":"/build-application/1/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });

    describe('Service call to get the current question', () => {
      it('should fetch the relevant question', async () => {
        await getServerSideProps(getContext());
        expect(getQuestion).toHaveBeenCalledTimes(1);
        expect(getQuestion).toHaveBeenCalledWith(
          'testSessionId',
          '1',
          'mockCustomSection',
          'shortAnswer'
        );
      });

      it('should error if the QUESTION service call is rejected - GENERIC getServerSideProps ERROR (try{} catch())', async () => {
        (getQuestion as jest.Mock).mockRejectedValue(axiosError);
        const response = await getServerSideProps(getContext());
        console.log(response);
        expect(response).toStrictEqual({
          redirect: {
            destination:
              '/error-page/code/500?href=/build-application/1/preview',
            statusCode: 302,
          },
        });
      });

      it('should error if the QUESTION service call returns null', async () => {
        (getQuestion as jest.Mock).mockResolvedValue(null);
        const response = await getServerSideProps(getContext());
        console.log(response);
        expect(response).toStrictEqual({
          redirect: {
            destination:
              '/service-error?serviceErrorProps={"errorInformation":"Could not find the question, please make sure the URL is correct","linkAttributes":{"href":"/build-application/1/dashboard","linkText":"Please return","linkInformation":" and try again."}}',
            statusCode: 302,
          },
        });
      });
    });

    describe('Return value of props', () => {
      it('should return the correct props - WHEN THERE IS A NEXT QUESTION', async () => {
        const response = await getServerSideProps(getContext());

        expect(response).toStrictEqual({
          props: {
            question: mockCustomSection.questions[0],
            backHref: `/build-application/${mockApplicationId}/preview`,
            nextPreviewHref: `/build-application/${mockApplicationId}/${mockCustomSection.sectionId}/${mockCustomSection.questions[1].questionId}/unpublished-preview`,
          },
        });
      });

      it('should return the correct props - WHEN THERE IS NOT A NEXT QUESTION', async () => {
        (getQuestion as jest.Mock).mockResolvedValueOnce(
          mockCustomSection.questions[8]
        );
        const response = await getServerSideProps(
          getContext({
            params: {
              applicationId: mockApplicationId,
              sectionId: mockCustomSection.sectionId,
              questionId: mockCustomSection.questions[8].questionId,
            },
          })
        );

        expect(response).toStrictEqual({
          props: {
            question: mockCustomSection.questions[8],
            backHref: backHref,
            nextPreviewHref: null,
          },
        });
      });
    });
  });
});
