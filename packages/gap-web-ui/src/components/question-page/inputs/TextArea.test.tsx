import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TextArea, { TextAreaProps } from './TextArea';

const customProps: TextAreaProps = {
  questionTitle: 'Page title',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldName: 'fieldName',
  fieldErrors: [],
};

const component = <TextArea {...customProps} />;

describe('Text Area component', () => {
  it('Renders the provided page title as h1', () => {
    render(component);
    //level:1 check if is an h1, eg level:6 would check if is an h6
    screen.getByRole('heading', { name: 'Page title', level: 1 });
  });

  it('Renders the provided page title as h2 when titleTag is h2', () => {
    render(<TextArea {...customProps} TitleTag={'h2'} />);
    screen.getByRole('heading', { name: 'Page title', level: 2 });
  });

  it('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<TextArea {...customProps} titleSize="m" />);
    expect(screen.getByText('Page title')).toHaveClass('govuk-label--m');
  });

  it('Renders a page description when a description is provided', () => {
    render(component);
    screen.getByText(
      'A description of the page and the question what it is asking'
    );
  });

  it('Does NOT render a page description when a description is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questionHintText, ...noDescProps } = customProps;
    render(<TextArea {...noDescProps} />);
    expect(
      screen.queryByText(
        'A description of the page and the question what it is asking'
      )
    ).toBeFalsy();
  });

  it('Does renders example text when present', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const props = {
      ...customProps,
      exampleText: { title: 'test title', text: 'test text' },
    };
    render(<TextArea {...props} />);
    expect(
      screen.queryByText('See examples of short description')
    ).toBeDefined();
  });

  it('Does NOT render example text when present', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const props = {
      ...customProps,
      exampleText: undefined,
    };
    render(<TextArea {...props} />);
    expect(screen.queryByText('See examples of short description')).toBeFalsy();
  });

  describe('Text Area input', () => {
    it('Renders the textarea input field', () => {
      render(component);
      screen.getByRole('textbox', { name: 'Page title' });
    });

    it('Input field is empty when there is no default value', () => {
      render(component);
      const textAreaElement = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textAreaElement).toHaveValue('');
    });

    it('Input field is assigned the provided default value', () => {
      render(<TextArea {...customProps} defaultValue="Default value" />);
      const textInputElement = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textInputElement).toHaveValue('Default value');
    });

    it('Renders 5 rows by default', () => {
      render(component);
      const textAreaElement = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textAreaElement).toHaveAttribute('rows', '5');
    });

    it('Renders the number of rows passed in', () => {
      render(<TextArea {...customProps} rows={10} />);
      const textAreaElement = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textAreaElement).toHaveAttribute('rows', '10');
    });

    it('Does NOT render a character limit hint when no limit is passed in', () => {
      render(component);
      expect(screen.queryByTestId('character-limit-div')).toBeFalsy();
    });

    it('Renders a character limit hint when a limit is passed in', () => {
      render(<TextArea {...customProps} limit={255} />);
      screen.getByText('You can enter up to 255 characters');
    });

    it('Renders a word limit hint when a word limit is passed in', () => {
      render(<TextArea {...customProps} limit={100} limitWords />);
      screen.getByText('You can enter up to 100 words');
    });

    it('Should default to NOT disabled', () => {
      render(<TextArea {...customProps} />);
      const textbox = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textbox).not.toHaveAttribute('disabled');
    });

    it('Should be disabled when the disabled prop is true', () => {
      render(<TextArea {...customProps} disabled />);
      const textbox = screen.getByRole('textbox', {
        name: 'Page title',
      });
      expect(textbox).toHaveAttribute('disabled');
    });

    it('Does NOT have gap-new-line class if newLineAccepted has not been passed as a prop', () => {
      render(component);
      const hintText = screen.getByText(
        'A description of the page and the question what it is asking'
      );
      expect(hintText).not.toHaveClass('gap-new-line');
    });

    it('Does have gap-new-line class if newLineAccepted has been passed as a prop', () => {
      render(<TextArea {...customProps} newLineAccepted={true} />);
      const hintText = screen.getByText(
        'A description of the page and the question what it is asking'
      );
      expect(hintText).toHaveClass('gap-new-line');
    });

    it('Title should have a custom titleSize when multipleQuestionPage is true', () => {
      render(<TextArea {...customProps} />);
      const titleLabel = screen.getByTestId('Page-title-label');
      expect(titleLabel).toHaveClass('govuk-label');
      expect(titleLabel).toHaveClass('govuk-label--l');
    });

    it('Title should have a heading class when multipleQuestionPage is false', () => {
      render(<TextArea {...customProps} multipleQuestionPage={false} />);
      const titleLabel = screen.getByTestId('Page-title-label');
      expect(titleLabel).toHaveClass('govuk-heading-l');
    });
  });

  describe('Error cases', () => {
    const customPropsWithError = {
      ...customProps,
      fieldErrors: [
        {
          fieldName: customProps.fieldName,
          errorMessage: 'This field is required.',
        },
      ],
    };

    it('Renders a field error when an error is provided', () => {
      render(<TextArea {...customPropsWithError} />);
      screen.getByTestId('error-message-test-id');
    });

    it('Renders a red border to the left of the input area', () => {
      render(<TextArea {...customPropsWithError} />);
      expect(screen.getByTestId('text-area-component')).toHaveClass(
        'govuk-form-group--error'
      );
    });

    it('Does NOT render a field error when no error is provided', () => {
      render(component);
      expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
    });
  });
});
