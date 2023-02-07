import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import DateTimeInput from './DateTimeInput';

export default {
  title: 'gap-web-ui/TimeInput',
  component: DateTimeInput,
} as ComponentMeta<typeof DateTimeInput>;

const Template: ComponentStory<typeof DateTimeInput> = (args) => (
  <DateTimeInput {...args} />
);

const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'grant-type',
    errorMessage: 'Complete required fields',
  },
];

const props = {
  questionTitle: 'Please select time',
  questionHintText: 'Time selection hint text',
  fieldName: 'grant-type',
  fieldErrors: noValidationErrors,
};

export const Time = Template.bind({});
Time.args = { ...props };

export const TimeWithoutDescription = Template.bind({});
TimeWithoutDescription.args = { ...props, questionHintText: '' };

export const TimeWithPlaceholder = Template.bind({});
TimeWithPlaceholder.args = {
  ...props,
  timeDefaultValue: 'Please select time',
};

export const TimeWithDefaultValue = Template.bind({});
TimeWithDefaultValue.args = { ...props, timeDefaultValue: '1pm' };

export const TimeWithErrors = Template.bind({});
TimeWithErrors.args = { ...props, fieldErrors: validationErrors };
