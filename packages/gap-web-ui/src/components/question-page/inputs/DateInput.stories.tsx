import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import DateInput from './DateInput';

export default {
  title: 'gap-web-ui/DateInput',
  component: DateInput,
} as ComponentMeta<typeof DateInput>;

const Template: ComponentStory<typeof DateInput> = (args) => (
  <DateInput {...args} />
);

const noValidationErrors: ValidationError[] = [];
const validationError: ValidationError = {
  fieldName: 'date',
  errorMessage: 'Enter your date of birth',
};
const dayValidationError: ValidationError = {
  fieldName: 'date-day',
  errorMessage: 'Date of birth must include a day',
};
const monthValidationError: ValidationError = {
  fieldName: 'date-month',
  errorMessage: 'Date of birth must include a month',
};
const yearValidationError: ValidationError = {
  fieldName: 'date-year',
  errorMessage: 'Date of birth must include a year',
};
const yearAndMonthValidationError: ValidationError = {
  fieldName: 'date-year',
  errorMessage: 'Date of birth must include a year and a month',
};
const yearAndDayValidationError: ValidationError = {
  fieldName: 'date-year',
  errorMessage: 'Date of birth must include a year and a day',
};
const monthAndDayValidationError: ValidationError = {
  fieldName: 'date-day',
  errorMessage: 'Date of birth must include a month and a day',
};
const validationErrors: ValidationError[] = [validationError];

const props = {
  questionTitle: 'When is your birthday?',
  questionHintText: 'Please tell us your birthday, so we can send you sweeties',
  fieldName: 'date',
  fieldErrors: noValidationErrors,
};

export const DateInputWithDescription = Template.bind({});
DateInputWithDescription.args = { ...props };

export const DateInputWithoutDescription = Template.bind({});
DateInputWithoutDescription.args = { ...props, questionHintText: '' };

export const DateInputWithWholeDateError = Template.bind({});
DateInputWithWholeDateError.args = { ...props, fieldErrors: validationErrors };
export const DateInputWithDayError = Template.bind({});
DateInputWithDayError.args = { ...props, fieldErrors: [dayValidationError] };
export const DateInputWithMonthError = Template.bind({});
DateInputWithMonthError.args = {
  ...props,
  fieldErrors: [monthValidationError],
};
export const DateInputWithYearError = Template.bind({});
DateInputWithYearError.args = { ...props, fieldErrors: [yearValidationError] };
export const DateInputWithYearAndMonthError = Template.bind({});
DateInputWithYearAndMonthError.args = {
  ...props,
  fieldErrors: [yearAndMonthValidationError],
};
export const DateInputWithYearAndDayError = Template.bind({});
DateInputWithYearAndDayError.args = {
  ...props,
  fieldErrors: [yearAndDayValidationError],
};
export const DateInputWithMonthAndDayError = Template.bind({});
DateInputWithMonthAndDayError.args = {
  ...props,
  fieldErrors: [monthAndDayValidationError],
};

export const DateInputWithDefaultValues = Template.bind({});
DateInputWithDefaultValues.args = {
  ...props,
  defaultValues: { day: '01', month: '08', year: '2020' },
};
