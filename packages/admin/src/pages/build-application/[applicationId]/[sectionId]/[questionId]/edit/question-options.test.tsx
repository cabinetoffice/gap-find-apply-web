import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { QuestionWithOptionsSummary } from '../../../../../../types/QuestionSummary';
import QuestionOptions, { getServerSideProps } from './question-options.page';
import { ValidationError } from 'gap-web-ui';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';
import { getPageProps } from '../../../../../../testUtils/unitTestHelpers';
import InferProps from '../../../../../../types/InferProps';

describe('Question Options', () => {
  const parsedValidationErrors = [
    {
      fieldName: 'options[0]',
      errorMessage: 'Example error for the first option',
    },
    {
      fieldName: 'options[1]',
      errorMessage: 'Example error for the second option',
    },
  ] as ValidationError[];

  describe('UI', () => {
    const questionSummary: QuestionWithOptionsSummary = {
      fieldTitle: 'Mock Question With Options',
      hintText: 'This is a test question.',
      optional: 'no',
      responseType: ResponseTypeEnum.Dropdown,
    };

    const getDefaultProps = (): InferProps<typeof getServerSideProps> => ({
      questionSummary: questionSummary,
      backButtonHref: '/mockBackUrl',
      formAction: '/mockSubmitUrl',
      fieldErrors: [],
      options: ['Option one', 'Option two'],
      pageCaption: 'testPageCaption',
      cancelChangesHref: '/mockCancelUrl',
      csrfToken: 'testCSRFToken',
    });

    const component = <QuestionOptions {...getPageProps(getDefaultProps)} />;

    it('Should render a back button', () => {
      render(component);
      expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
        'href',
        '/apply/admin/mockBackUrl'
      );
    });

    it('Should render the flexible question page layout', () => {
      render(component);
      screen.getByTestId('question-page-form');
    });

    it('Should render the question summary', () => {
      render(component);
      screen.getByTestId('options-question-summary');
      screen.getByRole('heading', { name: 'Mock Question With Options' });
      screen.getByText('This is a test question.');
    });

    it('Should render a TextInput for each option', () => {
      render(component);
      const options = screen.getAllByTestId('text-input-component');
      expect(options).toHaveLength(2);
    });

    it('Should title each input with ordinal numbering', () => {
      render(component);
      screen.getByLabelText('Enter the first option');
      screen.getByLabelText('Enter the second option');
    });

    it('Should pre-populate each option with correct option value', () => {
      render(component);
      screen.getByDisplayValue('Option one');
      screen.getByDisplayValue('Option two');
    });

    it('Should NOT render "Delete" button for each option when there are 2 or less options present', () => {
      render(component);
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeFalsy();
    });

    it('Should render "Delete" button for each option when there are 3 or more options present', () => {
      render(
        <QuestionOptions
          {...getPageProps(getDefaultProps, {
            options: ['Option one', 'Option two', 'Option three'],
          })}
        />
      );
      screen.getByRole('button', { name: 'Delete the first option' });
      screen.getByRole('button', { name: 'Delete the second option' });
      screen.getByRole('button', { name: 'Delete the third option' });
    });

    it('Should render add another option button', () => {
      render(component);
      screen.getByRole('button', { name: 'Add another option' });
    });

    it('Should render "Save and continue" button', () => {
      render(component);
      screen.getByRole('button', { name: 'Save and continue' });
    });

    it('Should render "Cancel" link', () => {
      render(component);
      screen.getByRole('link', { name: 'Cancel' });
    });

    it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
      render(component);
      expect(document.title).toBe('Edit a question - Manage a grant');
    });

    it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
      render(
        <QuestionOptions
          {...getPageProps(getDefaultProps, {
            fieldErrors: parsedValidationErrors,
          })}
        />
      );
      expect(document.title).toBe('Error: Edit a question - Manage a grant');
    });
  });
});
