import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import TextInput, { TextInputComponentProps } from './TextInput';

export default {
  title: 'gap-web-ui/TextInput',
  component: TextInput,
} as ComponentMeta<typeof TextInput>;

const Template: ComponentStory<typeof TextInput> = (
  args: TextInputComponentProps
) => <TextInput {...args} />;
const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'details',
    errorMessage: 'Please fill in required field',
  },
];

export const WithDescription = Template.bind({});
WithDescription.args = {
  questionTitle: 'Can you provide more detail?',
  questionHintText:
    'Do not include personal or financial information, like your National Insurance number or credit card details',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  children: <button>Delete</button>,
  questionTitle: 'Text input with children',
  questionHintText:
    'The children prop is intended to allow adding elements, like buttons, to the input form group (allows for more flexible layout)',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
};

export const WithoutDescription = Template.bind({});
WithoutDescription.args = {
  questionTitle: 'Can you provide more detail?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  questionTitle: 'Can you provide more detail?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: validationErrors,
};

export const Numeric = Template.bind({});
Numeric.args = {
  questionTitle: 'What is the cost in pounds?',
  fieldName: 'cost',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  textInputSubtype: 'numeric',
  width: '10',
};

export const NumericWithError = Template.bind({});
NumericWithError.args = {
  questionTitle: 'What is the cost in pounds?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: validationErrors,
  textInputSubtype: 'numeric',
  width: '10',
};

export const WithPrefixAndSuffix = Template.bind({});
WithPrefixAndSuffix.args = {
  questionTitle: 'What is the cost in pounds?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  textInputSubtype: 'numeric',
  width: '10',
  fieldPrefix: '£',
  fieldSuffix: '.00',
};

export const WithCharLimit = Template.bind({});
WithCharLimit.args = {
  questionTitle: 'What is the cost in pounds?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  limit: 500,
};

export const WithWordLimit = Template.bind({});
WithWordLimit.args = {
  questionTitle: 'What is the cost in pounds?',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  limit: 500,
  limitWords: true,
};
