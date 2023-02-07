import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import TextArea from './TextArea';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'gap-web-ui/TextArea',
  component: TextArea,
} as ComponentMeta<typeof TextArea>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof TextArea> = (args) => (
  <TextArea {...args} />
);

const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'details',
    errorMessage: 'Please fill in required field',
  },
];

export const WithDescription = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
WithDescription.args = {
  questionTitle: 'Can you provide more detail?',
  questionHintText:
    'Do not include personal or financial information, like your National Insurance number or credit card details',
  limitWords: false,
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  rows: 5,
};

export const WithoutDescription = Template.bind({});
WithoutDescription.args = {
  questionTitle: 'Can you provide more detail?',
  limitWords: false,
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  rows: 5,
};

export const WithWordLimit = Template.bind({});
WithWordLimit.args = {
  questionTitle: 'Can you provide more detail?',
  questionHintText:
    'Do not include personal or financial information, like your National Insurance number or credit card details',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: noValidationErrors,
  limitWords: false,
  limit: 250,
  rows: 5,
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  questionTitle: 'Can you provide more detail?',
  limitWords: false,
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: validationErrors,
  rows: 5,
};
