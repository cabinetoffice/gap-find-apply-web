import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TextInput from './TextInput';

const customProps = {
  questionTitle: 'Page title',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldName: 'fieldName',
  fieldErrors: [],
};

const component = <TextInput {...customProps} />;

describe('Text Input component', () => {
  it('Renders the provided page title as h1', () => {
    render(component);
    //level:1 check if is an h1, eg level:6 would check if is an h6
    screen.getByRole('heading', { name: 'Page title', level: 1 });
  });

  it('Renders the provided page title as h2 when titleTag is h2', () => {
    render(<TextInput {...customProps} TitleTag={'h2'} />);
    screen.getByRole('heading', { name: 'Page title', level: 2 });
  });

  it('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<TextInput {...customProps} titleSize="m" />);
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
    render(<TextInput {...noDescProps} />);
    expect(
      screen.queryByText(
        'A description of the page and the question what it is asking'
      )
    ).toBeFalsy();
  });

  it('Renders the textbox input field', () => {
    render(component);
    screen.getByTestId('input-field');
  });

  it('Links the page title (for screen readers) to the textbox input field', () => {
    render(component);
    screen.getByRole('textbox', { name: 'Page title' });
  });

  it('Input field is empty when there is no default value', () => {
    render(component);
    const textInputElement = screen.getByTestId('input-field');
    expect(textInputElement).toHaveAttribute('value', '');
  });

  it('Input field is assigned the provided default value', () => {
    render(<TextInput {...customProps} defaultValue="Default value" />);
    const textInputElement = screen.getByTestId('input-field');
    expect(textInputElement).toHaveAttribute('value', 'Default value');
  });

  it('Should display input field with given width', () => {
    render(<TextInput {...customProps} width="30" />);
    expect(
      screen.getByRole('textbox', {
        name: 'Page title',
      })
    ).toHaveClass('govuk-input--width-30');
  });

  it('Should not set input width if no width is given', () => {
    render(<TextInput {...customProps} />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).toHaveClass('govuk-input');
    expect(textbox).not.toHaveClass('govuk-input--width-30');
  });

  it('Should display input field with given fluid width class', () => {
    render(<TextInput {...customProps} fluidWidth="three-quarters" />);
    expect(
      screen.getByRole('textbox', {
        name: 'Page title',
      })
    ).toHaveClass('govuk-!-width-three-quarters');
  });

  it('Should not set input width if no width is given', () => {
    render(<TextInput {...customProps} />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).toHaveClass('govuk-input');
    expect(textbox).not.toHaveClass('govuk-!-width-three-quarters');
  });

  it('Should default to NOT read-only', () => {
    render(<TextInput {...customProps} />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).not.toHaveAttribute('readOnly');
  });

  it('Should be read-only when the readOnly prop is true', () => {
    render(<TextInput {...customProps} readOnly />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).toHaveAttribute('readOnly');
  });

  it('Should default to NOT disabled', () => {
    render(<TextInput {...customProps} />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).not.toHaveAttribute('disabled');
  });

  it('Should be disabled when the disabled prop is true', () => {
    render(<TextInput {...customProps} disabled />);
    const textbox = screen.getByRole('textbox', {
      name: 'Page title',
    });
    expect(textbox).toHaveAttribute('disabled');
  });

  it('Should render provided children', () => {
    render(
      <TextInput {...customProps}>
        <button>Save and exit</button>
      </TextInput>
    );
    screen.getByRole('button', { name: 'Save and exit' });
  });

  it('Does NOT render a character limit hint when no limit is passed in', () => {
    render(component);
    expect(screen.queryByTestId('character-limit-div')).toBeFalsy();
  });

  it('Renders a character limit hint when a limit is passed in', () => {
    render(<TextInput {...customProps} limit={255} />);
    screen.getByText('You can enter up to 255 characters');
  });

  it('Does NOT have gap-new-line class if newLineAccepted has not been passed as a prop', () => {
    render(component);
    const hintText = screen.getByText(
      'A description of the page and the question what it is asking'
    );
    expect(hintText).not.toHaveClass('gap-new-line');
  });

  it('Does have gap-new-line class if newLineAccepted has been passed as a prop as true', () => {
    render(<TextInput {...customProps} newLineAccepted={true} />);
    const hintText = screen.getByText(
      'A description of the page and the question what it is asking'
    );
    expect(hintText).toHaveClass('gap-new-line');
  });

  it('Title should have a custom titleSize when multipleQuestionPage is true', () => {
    render(<TextInput {...customProps} />);
    const titleLabel = screen.getByTestId('Page-title-label');
    expect(titleLabel).toHaveClass('govuk-label');
    expect(titleLabel).toHaveClass('govuk-label--l');
  });

  it('Title should have a heading class when multipleQuestionPage is false', () => {
    render(<TextInput {...customProps} multipleQuestionPage={false} />);
    const titleLabel = screen.getByTestId('Page-title-label');
    expect(titleLabel).toHaveClass('govuk-heading-l');
  });

  describe('Text input subtypes', () => {
    it('Renders an input with email attributes when the text input subtype is email', () => {
      const props = {
        ...customProps,
        fieldName: 'email',
      };
      render(<TextInput {...props} textInputSubtype="email" />);
      const textInputElement = screen.getByTestId('input-field');
      expect(textInputElement).toHaveAttribute('name', 'email');
      expect(textInputElement).toHaveAttribute('type', 'email');
      expect(textInputElement).toHaveAttribute('spellcheck', 'false');
      expect(textInputElement).toHaveAttribute('autocomplete', 'email');
    });

    it('Renders an input with national insurance number attributes when the text input subtype is nationalInsuranceNumber', () => {
      render(
        <TextInput
          {...customProps}
          textInputSubtype="nationalInsuranceNumber"
        />
      );
      const textInputElement = screen.getByTestId('input-field');
      expect(textInputElement).toHaveClass('govuk-input--width-10');
      expect(textInputElement).toHaveAttribute('spellcheck', 'false');
    });

    it('Renders an input with numeric attributes when the text input subtype is numeric', () => {
      render(<TextInput {...customProps} textInputSubtype="numeric" />);
      const textInputElement = screen.getByTestId('input-field');
      expect(textInputElement).toHaveAttribute('name', 'fieldName');
      expect(textInputElement).toHaveAttribute('id', 'fieldName');
      expect(textInputElement).toHaveAttribute('type', 'text');
      expect(textInputElement).toHaveAttribute('spellcheck', 'false');
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
      render(<TextInput {...customPropsWithError} />);
      screen.getByTestId('error-message-test-id');
    });

    it('Renders a red border to the left of the input area', () => {
      render(<TextInput {...customPropsWithError} />);
      expect(screen.getByTestId('text-input-component')).toHaveClass(
        'govuk-form-group--error'
      );
    });

    it('Does NOT render a field error when no error is provided', () => {
      render(component);
      expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
    });
  });
});
