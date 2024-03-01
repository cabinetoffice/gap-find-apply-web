import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionContent, { getServerSideProps } from './index.page';
import InferProps from '../../../../../../../types/InferProps';
import ResponseTypeEnum from '../../../../../../../enums/ResponseType';
import { getPageProps } from '../../../../../../../testUtils/unitTestHelpers';

const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
  fieldErrors: [],
  pageData: {
    backButtonHref: '/back',
    deleteConfirmationUrl: '',
    backTo: '',
    questionData: {
      responseType: ResponseTypeEnum.ShortAnswer,
      validation: { mandatory: undefined },
      fieldTitle: 'Test Section Field Title',
      hintText: 'Test hint text',
      questionId: 'testQuestionId',
      adminSummary: '',
      profileField: '',
      fieldPrefix: '',
      questionSuffix: '',
      displayText: '',
    },
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

describe('Question content page', () => {
  it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
    render(
      <QuestionContent
        {...getPageProps(getDefaultProps, {
          fieldErrors: [{ fieldName: 'anything', errorMessage: 'Error' }],
        })}
      />
    );

    expect(document.title).toBe('Error: Edit this question - Manage a grant');
  });

  it('Should render a back button with correct link on it', () => {
    render(<QuestionContent {...getPageProps(getDefaultProps)} />);

    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/apply/admin/back'
    );
  });

  it('Renders the question page layout output', () => {
    render(<QuestionContent {...getPageProps(getDefaultProps)} />);

    expect(document.title).toBe('Edit this question - Manage a grant');
    screen.getByTestId('question-page-form');
    screen.getByTestId('text-input-component');
    screen.getByTestId('text-area-component');
    screen.getByTestId('character-limit-div');
    screen.getByTestId('radioFormDiv');
    screen.getByRole('button', { name: 'Save changes' });
  });

  describe('Optional question component', () => {
    it('Has no default', () => {
      render(<QuestionContent {...getPageProps(getDefaultProps)} />);

      expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked();
    });

    it('Has a default of the previous value prop when it exists', () => {
      render(
        <QuestionContent
          {...getPageProps(getDefaultProps, {
            previousValues: { optional: 'true' },
            pageData: {
              questionData: {
                ...getDefaultProps().pageData.questionData,
                responseType: ResponseTypeEnum.LongAnswer,
                validation: {
                  mandatory: 'true',
                },
              },
            },
          })}
        />
      );

      expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked();
      expect(screen.getByRole('radio', { name: 'Yes' })).toBeChecked();
    });

    it('Has a default of the questionData validation maxWords when it exists', () => {
      render(
        <QuestionContent
          {...getPageProps(getDefaultProps, {
            pageData: {
              questionData: {
                ...getDefaultProps().pageData.questionData,
                responseType: ResponseTypeEnum.LongAnswer,
                validation: {
                  mandatory: 'true',
                },
              },
            },
          })}
        />
      );

      expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Yes' })).not.toBeChecked();
    });
  });

  describe('Word limit component', () => {
    it('Does NOT render a "Set a word limit" component if the question is NOT a long answer', () => {
      render(<QuestionContent {...getPageProps(getDefaultProps)} />);

      expect(
        screen.queryByRole('textbox', { name: 'Set a word limit' })
      ).toBeNull();
    });

    it('Renders the "Set a word limit" component if the question is a long answer', () => {
      render(
        <QuestionContent
          {...getPageProps(getDefaultProps, {
            pageData: {
              questionData: {
                ...getDefaultProps().pageData.questionData,
                responseType: ResponseTypeEnum.LongAnswer,
              },
            },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { name: 'Set a word limit' })
      ).toHaveValue('');
    });

    it('Word limit has a default of the previous value prop when it exists', () => {
      render(
        <QuestionContent
          {...getPageProps(getDefaultProps, {
            previousValues: { maxWords: '50000' },
            pageData: {
              questionData: {
                ...getDefaultProps().pageData.questionData,
                responseType: ResponseTypeEnum.LongAnswer,
                validation: {
                  maxWords: '300',
                },
              },
            },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { name: 'Set a word limit' })
      ).toHaveValue('50000');
    });

    it('Word limit has a default of the questionData validation maxWords when it exists', () => {
      render(
        <QuestionContent
          {...getPageProps(getDefaultProps, {
            pageData: {
              questionData: {
                ...getDefaultProps().pageData.questionData,
                responseType: ResponseTypeEnum.LongAnswer,
                validation: {
                  maxWords: '300',
                },
              },
            },
          })}
        />
      );

      expect(
        screen.getByRole('textbox', { name: 'Set a word limit' })
      ).toHaveValue('300');
    });
  });
});
