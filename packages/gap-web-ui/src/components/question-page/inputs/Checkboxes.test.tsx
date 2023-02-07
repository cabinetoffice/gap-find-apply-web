import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ValidationError } from '../../../types';
import Checkboxes, { CheckboxesProps } from './Checkboxes';
import TextInput from './TextInput';

const options: string[] = ['British', 'Irish', 'Other'];
const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'nationality',
    errorMessage: 'Select an option',
  },
];
const props: CheckboxesProps = {
  questionTitle: 'What is your nationality?',
  questionHintText:
    'If you have dual nationality, select all options that are relevant to you.',
  fieldName: 'nationality',
  options: options,
  fieldErrors: noValidationErrors,
};
const propsWithErrors: CheckboxesProps = {
  ...props,
  fieldErrors: validationErrors,
};
const component = <Checkboxes {...props} />;
const componentWithErrors = <Checkboxes {...propsWithErrors} />;

describe('Checkbox component', () => {
  it('Should render page title', () => {
    render(component);
    expect(
      screen.getByRole('heading', { name: /what is your nationality\?/i })
    );
  });

  it('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<Checkboxes {...props} titleSize="m" />);
    expect(screen.getByTestId('title-legend')).toHaveClass(
      'govuk-fieldset__legend--m'
    );
  });

  it('Should render page description', () => {
    render(component);
    expect(
      screen.getByText(
        /if you have dual nationality, select all options that are relevant to you\./i
      )
    );
  });

  it('Should render checkbox options', () => {
    render(component);
    screen.getByRole('checkbox', { name: /british/i });
    screen.getByRole('checkbox', { name: /irish/i });
    screen.getByRole('checkbox', { name: /other/i });
  });

  it('Should check defaultCheckboxes', () => {
    render(<Checkboxes {...props} defaultCheckboxes={['British']} />);
    expect(screen.getByRole('checkbox', { name: /british/i })).toHaveAttribute(
      'checked'
    );
  });

  it('Should default to NOT disabled', () => {
    render(<Checkboxes {...props} />);
    expect(
      screen.getByRole('checkbox', { name: /british/i })
    ).not.toHaveAttribute('disabled');
    expect(
      screen.getByRole('checkbox', { name: /irish/i })
    ).not.toHaveAttribute('disabled');
    expect(
      screen.getByRole('checkbox', { name: /other/i })
    ).not.toHaveAttribute('disabled');
  });

  it('Should be disabled when the disabled prop is true', () => {
    render(<Checkboxes {...props} disabled />);
    expect(screen.getByRole('checkbox', { name: /british/i })).toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('checkbox', { name: /irish/i })).toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('checkbox', { name: /other/i })).toHaveAttribute(
      'disabled'
    );
  });

  it('Should NOT divide the final option by default', () => {
    render(<Checkboxes {...props} options={['Yes', 'No', 'Maybe? :O']} />);
    expect(screen.queryByText('or')).toBeFalsy();
  });

  it('Should divide the final option when the divideLastRadioOption is true', () => {
    render(
      <Checkboxes
        {...props}
        options={['Yes', 'No', 'Maybe? :O']}
        divideLastCheckboxOption={true}
      />
    );
    screen.getByText('or');
  });

  it('Should not have "data-behaviour" by default', () => {
    render(<Checkboxes {...props} options={['Yes', 'No', 'Maybe? :O']} />);

    screen.getAllByRole('checkbox').forEach((checkbox) => {
      expect(checkbox).not.toHaveAttribute('data-behaviour');
    });
  });

  it('Should have "data-behaviour" for the final option when divideLastCheckboxOption is true', () => {
    render(
      <Checkboxes
        {...props}
        options={['Yes', 'No', 'Maybe?']}
        divideLastCheckboxOption={true}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox, index) => {
      if (index === 2) {
        expect(checkbox).toHaveAttribute('data-behaviour', 'exclusive');
      } else {
        expect(checkbox).not.toHaveAttribute('data-behaviour');
      }
    });
  });

  it('Should have "data-behaviour" for the first option when divideLastCheckboxOption is true & divideCheckboxIndex is 1', () => {
    render(
      <Checkboxes
        {...props}
        options={['Yes', 'No', 'Maybe?']}
        divideLastCheckboxOption={true}
        divideCheckboxIndex={1}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox, index) => {
      if (index === 0) {
        expect(checkbox).toHaveAttribute('data-behaviour', 'exclusive');
      } else {
        expect(checkbox).not.toHaveAttribute('data-behaviour');
      }
    });
  });

  it('Should have "data-behaviour" for no options when divideLastCheckboxOption is true', () => {
    render(
      <Checkboxes
        {...props}
        options={['Yes', 'No', 'Maybe?', 'Perhaps']}
        divideLastCheckboxOption={true}
        divideCheckboxIndex={2}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) =>
      expect(checkbox).not.toHaveAttribute('data-behaviour')
    );
  });

  it('should render the conditionally rendered elements when they are passed in', () => {
    const checkboxOptions = [
      {
        label: 'test1',
        conditionalInput: <p>This is some conditionally rendered text</p>,
      },
      {
        label: 'test2',
        conditionalInput: (
          <p>This is some different conditionally rendered text</p>
        ),
      },
    ];

    render(<Checkboxes {...props} options={checkboxOptions} />);

    screen.getByText('This is some conditionally rendered text');
    screen.getByText('This is some different conditionally rendered text');
  });

  it('Should link data-aria-controls to the conditionally rendered input', () => {
    const checkboxOptions = [
      {
        label: 'test1',
        conditionalInput: (
          <TextInput
            questionTitle="testConditionalInput1"
            fieldErrors={[]}
            fieldName="testConditionalInput1"
          />
        ),
      },
      {
        label: 'test2',
        conditionalInput: (
          <TextInput
            questionTitle="testConditionalInput2"
            fieldErrors={[]}
            fieldName="testConditionalInput2"
          />
        ),
      },
    ];

    render(<Checkboxes {...props} options={checkboxOptions} />);

    expect(screen.getByRole('checkbox', { name: 'test1' })).toHaveAttribute(
      'data-aria-controls',
      'conditional-nationality'
    );
    expect(screen.getByTestId('conditional-input-wrapper-1')).toHaveAttribute(
      'id',
      'conditional-nationality'
    );
    expect(screen.getByRole('checkbox', { name: 'test2' })).toHaveAttribute(
      'data-aria-controls',
      'conditional-nationality-2'
    );
    expect(screen.getByTestId('conditional-input-wrapper-2')).toHaveAttribute(
      'id',
      'conditional-nationality-2'
    );
  });
});

describe('Checkbox component errors', () => {
  it('Should render error message', () => {
    render(componentWithErrors);
    expect(screen.getByText(/select an option/i));
  });

  it('Should render error border', () => {
    render(componentWithErrors);
    expect(screen.getByTestId('checkbox-component')).toHaveClass(
      'govuk-form-group--error'
    );
  });

  it('Should NOT render a field error when no error is provided', () => {
    render(component);
    expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
  });
});
