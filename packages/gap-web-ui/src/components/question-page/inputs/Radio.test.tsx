import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RadioOption } from '../../../types/InputType';
import Radio, { RadioProps } from './Radio';
import TextInput from './TextInput';

const props: RadioProps = {
  questionTitle: 'Title',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldErrors: [],
  fieldName: 'fieldNameTest',
};

const component = <Radio {...props} />;

describe('Radio component', () => {
  test('should display Title as h1', () => {
    render(<Radio {...props} />);

    screen.getByRole('heading', {
      name: /title/i,
      level: 1,
    });
  });

  it('Renders the provided page title as h2 when titleTag is h2', () => {
    render(<Radio {...props} TitleTag={'h2'} />);
    screen.getByRole('heading', { name: /title/i, level: 2 });
  });

  test('Renders the title in correct size when titleSize parameter is provided', () => {
    render(<Radio {...props} titleSize="m" />);
    expect(screen.getByTestId('title-legend')).toHaveClass(
      'govuk-fieldset__legend--m'
    );
  });

  test('Renders a page description when a description is provided', () => {
    render(component);
    screen.getByText(
      'A description of the page and the question what it is asking'
    );
  });

  test('Does NOT render a page description when a description is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { questionHintText, ...noDescProps } = props;
    render(<Radio {...noDescProps} />);
    expect(
      screen.queryByText(
        'A description of the page and the question what it is asking'
      )
    ).toBeFalsy();
  });

  test('should display default yes and no buttons not checked', () => {
    render(<Radio {...props} />);

    const radios = screen.getAllByRole('radio');
    screen.getByRole('radio', { name: 'Yes' });
    screen.getByRole('radio', { name: 'No' });
    expect(radios).toHaveLength(2);
    radios.forEach((radio) => expect(radio).not.toHaveAttribute('checked'));
  });

  test('should display Description if passed', () => {
    render(<Radio {...props} questionHintText={'test description'} />);

    screen.getByText(/test description/i);
  });

  test('should have radio checked if Defaultchecked has been passed', () => {
    render(<Radio {...props} defaultChecked="Yes" />);

    const yesRadio = screen.getByRole('radio', { name: 'Yes' });

    expect(yesRadio).toHaveAttribute('checked');
  });

  test('should not have radio checked if the Defaultchecked passed is wrong', () => {
    render(<Radio {...props} defaultChecked="Wrong" />);

    const radios = screen.getAllByRole('radio');

    expect(radios).toHaveLength(2);
    radios.forEach((radio) => expect(radio).not.toHaveAttribute('checked'));
  });

  test('should render the Radio Button labels when they are passed in', () => {
    const radioButtonsNeeded = [
      { label: 'test1' },
      { label: 'test2' },
      { label: 'test3' },
      { label: 'test4' },
    ] as RadioOption[];
    render(<Radio {...props} radioOptions={radioButtonsNeeded} />);

    const radios = screen.getAllByRole('radio');
    radioButtonsNeeded.forEach((radio) =>
      screen.getByRole('radio', { name: radio.label })
    );
    expect(radios).toHaveLength(4);
  });

  test('should add a correct value to Radio Button when a a value differing from the label is passed in', () => {
    const radioButtonsNeeded = [
      { label: 'test1', value: 'radioValue1' },
      { label: 'test2', value: 'radioValue2' },
      { label: 'test3', value: 'radioValue3' },
      { label: 'test4', value: 'radioValue4' },
    ] as RadioOption[];
    render(<Radio {...props} radioOptions={radioButtonsNeeded} />);

    radioButtonsNeeded.forEach((radio) =>
      expect(screen.getByRole('radio', { name: radio.label })).toHaveAttribute(
        'value',
        radio.value
      )
    );
  });

  test('should render the Radio Button hints when they are passed in', () => {
    const radioButtons = [
      { label: 'test1', hint: 'This is a hint' },
      { label: 'test2', hint: 'This is another hint' },
    ] as RadioOption[];

    render(<Radio {...props} radioOptions={radioButtons} />);

    radioButtons.forEach((radio) => screen.getByText(radio.hint as string));
  });

  test('should render the Radio Button conditionally rendered elements when they are passed in', () => {
    const radioButtons = [
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
    ] as RadioOption[];

    render(<Radio {...props} radioOptions={radioButtons} />);

    screen.getByText('This is some conditionally rendered text');
    screen.getByText('This is some different conditionally rendered text');
  });

  test('should not display Error if fieldError is empty', () => {
    render(<Radio {...props} />);

    const radioFormDiv = screen.getByTestId('radioFormDiv');
    expect(radioFormDiv).toHaveClass('govuk-form-group');
  });

  test('should display Error if fieldError is not empty', () => {
    const propsWithError: RadioProps = {
      ...props,
      fieldErrors: [
        { fieldName: props.fieldName, errorMessage: 'Error Message' },
      ],
    };
    render(<Radio {...propsWithError} />);

    const radioFormDiv = screen.getByTestId('radioFormDiv');

    screen.getByText(/error message/i);
    expect(radioFormDiv).toHaveClass('govuk-form-group--error');
  });

  test('Should default to NOT disabled', () => {
    render(<Radio {...props} />);
    expect(screen.getByRole('radio', { name: 'Yes' })).not.toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('radio', { name: 'No' })).not.toHaveAttribute(
      'disabled'
    );
  });

  test('Should be disabled when the disabled prop is true', () => {
    render(<Radio {...props} disabled />);
    expect(screen.getByRole('radio', { name: 'Yes' })).toHaveAttribute(
      'disabled'
    );
    expect(screen.getByRole('radio', { name: 'No' })).toHaveAttribute(
      'disabled'
    );
  });

  test('Should NOT divide the final option by default', () => {
    render(
      <Radio
        {...props}
        radioOptions={[
          { label: 'Yes' },
          { label: 'No' },
          { label: 'Maybe? :O' },
        ]}
      />
    );
    expect(screen.queryByText('or')).toBeFalsy();
  });

  test('Should divide the final option when the divideLastRadioOption is true', () => {
    render(
      <Radio
        {...props}
        radioOptions={[
          { label: 'Yes' },
          { label: 'No' },
          { label: 'Maybe? :O' },
        ]}
        divideLastRadioOption={true}
      />
    );
    screen.getByText('or');
  });

  test('Should link data-aria-controls to the conditionally rendered input', () => {
    const radioButtons = [
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
    ] as RadioOption[];

    render(<Radio {...props} radioOptions={radioButtons} />);

    expect(screen.getByRole('radio', { name: 'test1' })).toHaveAttribute(
      'data-aria-controls',
      'conditional-fieldNameTest'
    );
    expect(screen.getByTestId('conditional-input-wrapper-1')).toHaveAttribute(
      'id',
      'conditional-fieldNameTest'
    );
    expect(screen.getByRole('radio', { name: 'test2' })).toHaveAttribute(
      'data-aria-controls',
      'conditional-fieldNameTest-2'
    );
    expect(screen.getByTestId('conditional-input-wrapper-2')).toHaveAttribute(
      'id',
      'conditional-fieldNameTest-2'
    );
  });

  test('Should link aria-describedby to the hint text', () => {
    const radioButtons = [
      { label: 'test1', hint: 'This is a hint' },
      { label: 'test2', hint: 'This is another hint' },
    ] as RadioOption[];

    render(<Radio {...props} radioOptions={radioButtons} />);

    expect(screen.getByRole('radio', { name: 'test1' })).toHaveAttribute(
      'aria-describedby',
      'fieldNameTest-hint'
    );
    expect(screen.getByTestId('hint-wrapper-1')).toHaveAttribute(
      'id',
      'fieldNameTest-hint'
    );
    expect(screen.getByRole('radio', { name: 'test2' })).toHaveAttribute(
      'aria-describedby',
      'fieldNameTest-2-hint'
    );
    expect(screen.getByTestId('hint-wrapper-2')).toHaveAttribute(
      'id',
      'fieldNameTest-2-hint'
    );
  });
});
