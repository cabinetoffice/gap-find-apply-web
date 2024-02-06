import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionContent, { getServerSideProps } from './index.page';
import InferProps from '../../../../../../../types/InferProps';
import ResponseTypeEnum from '../../../../../../../enums/ResponseType';

const customProps: InferProps<typeof getServerSideProps> = {
  fieldErrors: [],
  pageData: {
    backButtonHref: '/back',
    deleteConfirmationUrl: '',
    backTo: '',
    questionData: {
      responseType: ResponseTypeEnum.ShortAnswer,
      validation: { mandatory: 'true', maxWords: '300' },
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
    optional: 'false',
    maxWords: '300',
  },
  formAction: '',
  csrfToken: '',
};

const component = <QuestionContent {...customProps} />;

describe('Question content page', () => {
  describe('UI', () => {
    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionContent
          {...customProps}
          fieldErrors={[{ fieldName: 'anything', errorMessage: 'Error' }]}
        />
      );

      expect(document.title).toBe('Error: Edit this question - Manage a grant');
    });

    it('Should render a back button with correct link on it', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/back'
      );
    });

    it('Renders the question page layout output', () => {
      render(component);
      expect(document.title).toBe('Edit this question - Manage a grant');
      screen.getByTestId('question-page-form');
      screen.getByTestId('text-input-component');
      screen.getByTestId('text-area-component');
      screen.getByTestId('character-limit-div');
      screen.getByTestId('radioFormDiv');
      screen.getByRole('button', { name: 'Save changes' });
    });
  });
});
