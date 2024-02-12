import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import QuestionType from './index.page';
import { merge } from 'lodash';

describe('Question type page', () => {
  const getProps = (overrides: any = {}) =>
    merge(
      {
        pageData: {
          sectionName: 'Custom section name',
          backButtonHref: '/back',
        },
        formAction: '#',
        fieldErrors: [],
      },
      overrides
    );

  const component = <QuestionType {...getProps()} />;

  it('Should render a back button', () => {
    render(component);
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute(
      'href',
      '/apply/back'
    );
  });

  it('Should render the question page layout output', () => {
    render(component);
    screen.getByTestId('question-page-form');
  });

  it('Should render a hint for the short answer radio option', () => {
    render(component);
    screen.getByText('Short answer');
  });

  it('Should render a page caption with the passed in sectionName', () => {
    render(component);
    screen.getByText('Custom section name');
  });

  it('Should render a meta title without "Error: " when fieldErrors is empty', () => {
    render(component);
    expect(document.title).toBe('Add a question - Manage a grant');
  });

  it('Should render a meta title with "Error: " when fieldErrors is NOT empty', () => {
    render(
      <QuestionType
        {...getProps({
          fieldErrors: [{ fieldName: 'anything', errorMessage: 'Error' }],
        })}
      />
    );

    expect(document.title).toBe('Error: Add a question - Manage a grant');
  });

  it('Should have a short answer', () => {
    render(component);
    screen.getByRole('radio', { name: 'Short answer' });
    screen.getByText('Can have a maximum of 300 words entered.');
  });

  it('Should have a long answer', () => {
    render(component);
    screen.getByRole('radio', { name: 'Long answer' });
    screen.getByText(
      'Can have a maximum of 5000 words entered. You can set a custom word limit.'
    );
  });

  it('Should have a radio answer', () => {
    render(component);
    screen.getByRole('radio', { name: 'Yes/No' });
    screen.getByText('Allows one option to be selected.');
  });

  it('Should have a multiple choice answer', () => {
    render(component);
    const multipleChoiceRadio = screen.getByRole('radio', {
      name: 'Multiple choice',
    }) as HTMLInputElement;
    expect(multipleChoiceRadio.value).toBe('Dropdown');
    screen.getByText('Allows just one option to be selected from multiple.');
  });

  it('Should have a multiple select answer', () => {
    render(component);
    const MultipleSelectionRadio = screen.getByRole('radio', {
      name: 'Multiple select',
    }) as HTMLInputElement;
    expect(MultipleSelectionRadio.value).toBe('MultipleSelection');
    screen.getByText(
      'Allows more than one option to be selected from multiple.'
    );
  });

  it('Should have a document upload answer', () => {
    render(component);
    screen.getByRole('radio', { name: 'Document upload' });
    screen.getByText(
      'Allows files that are .DOC, .DOCX, .ODT, .PDF, .XLS, .XLSX or .ZIP'
    );
  });

  it('Should have a date answer', () => {
    render(component);
    screen.getByRole('radio', { name: 'Date' });
    screen.getByText('Allows a DD/MM/YYYY format to be entered.');
  });

  it('Should select a default radio if defaultRadio is provided', () => {
    render(
      <QuestionType
        {...getProps({ pageData: { defaultRadio: 'Multiple choice' } })}
      />
    );
    const defaultRadio = screen.getByRole('radio', {
      name: 'Multiple choice',
    });
    expect(defaultRadio).toBeChecked();
  });
});
