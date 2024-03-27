import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PreviewInputSwitch from './preview-input-switch';
import { merge } from 'lodash';

describe('PreviewInputSwitch', () => {
  const getQuestion = (overrides: any = {}) =>
    merge(
      {
        questionId: 'testQuestionId',
        fieldTitle: 'Test field title',
        hintText: 'Test description of a question',
        responseType: 'ShortAnswer',
        validation: { mandatory: true },
      },
      overrides
    );

  it('Should render the question title when mandatory is true', () => {
    render(<PreviewInputSwitch {...getQuestion()} />);
    screen.getByRole('heading', { name: 'Test field title' });
  });

  it('Should render the question title & (optional) when mandatory is false', () => {
    render(
      <PreviewInputSwitch
        {...getQuestion({ validation: { mandatory: false } })}
      />
    );
    screen.getByRole('heading', { name: 'Test field title (optional)' });
  });

  it('Should render a question hint when the question has a hint', () => {
    render(<PreviewInputSwitch {...getQuestion()} />);
    screen.getByText('Test description of a question');
  });

  it('Should throw an error if the response type does not map to a valid input', () => {
    expect(() =>
      PreviewInputSwitch({ ...getQuestion({ responseType: '' }) })
    ).toThrowError('Response type could not be mapped to an input');
  });

  it('Should render a text input when the responseType is "ShortAnswer"', () => {
    render(<PreviewInputSwitch {...getQuestion()} />);
    screen.getByRole('textbox');
  });

  it('Should render a date input when the responseType is "Date"', () => {
    render(<PreviewInputSwitch {...getQuestion({ responseType: 'Date' })} />);
    screen.getByRole('textbox', {
      name: /day/i,
    });
    screen.getByRole('textbox', {
      name: /month/i,
    });
    screen.getByRole('textbox', {
      name: /year/i,
    });
  });

  it('Should render a radio input when the responseType is "YesNo"', () => {
    render(<PreviewInputSwitch {...getQuestion({ responseType: 'YesNo' })} />);
    screen.getByRole('radio', { name: 'Yes' });
    screen.getByRole('radio', { name: 'No' });
  });

  it('Should render a text area when the responseType is "LongAnswer"', () => {
    render(
      <PreviewInputSwitch {...getQuestion({ responseType: 'LongAnswer' })} />
    );
    screen.getByRole('textbox');
  });

  it('Should render a document upload when the responseType is "SingleFileUpload"', () => {
    render(
      <PreviewInputSwitch
        {...getQuestion({ responseType: 'SingleFileUpload' })}
      />
    );
    screen.getByTestId('file-upload-input');
  });

  it('Should render a select input when the responseType is "Dropdown"', () => {
    render(
      <PreviewInputSwitch {...getQuestion({ responseType: 'Dropdown' })} />
    );
    screen.getByTestId('select-input-component');
  });

  it('Should render a radio input when the responseType is "MultipleSelection"', () => {
    render(
      <PreviewInputSwitch
        {...getQuestion({
          responseType: 'MultipleSelection',
          options: ['Option 1', 'Option 2'],
        })}
      />
    );
    screen.getByRole('checkbox', { name: 'Option 1' });
    screen.getByRole('checkbox', { name: 'Option 2' });
  });

  it('Should render a disabled textboxes when responseType is "Numeric"', () => {
    render(
      <PreviewInputSwitch
        {...getQuestion({
          responseType: 'Numeric',
        })}
      />
    );
    const disabledTextbox = screen.getByRole('textbox');
    expect(disabledTextbox).toBeDisabled;
  });

  it('Should render several disabled textboxes when responseType is "AddressInput"', () => {
    render(
      <PreviewInputSwitch
        {...getQuestion({
          responseType: 'AddressInput',
        })}
      />
    );
    const disabledTextboxes: HTMLElement[] = screen.getAllByRole('textbox');
    expect(disabledTextboxes).toHaveLength(5);
    expect(disabledTextboxes).toBeDisabled;
  });
});
