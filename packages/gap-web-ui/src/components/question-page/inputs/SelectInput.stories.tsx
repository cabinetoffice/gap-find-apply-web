import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import SelectInput from './SelectInput';

export default {
  title: 'gap-web-ui/SelectInput',
  component: SelectInput,
} as ComponentMeta<typeof SelectInput>;

const Template: ComponentStory<typeof SelectInput> = (args) => (
  <SelectInput {...args} />
);

const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'grant-type',
    errorMessage: 'Complete required fields',
  },
];

const props = {
  questionTitle: 'What type of grant are you looking for?',
  questionHintText: 'Select grant type',
  fieldName: 'grant-type',
  selectOptions: ['Competed grant', 'Criteria grant', 'Emergency grant'],
  fieldErrors: noValidationErrors,
};

export const Select = Template.bind({});
Select.args = { ...props };

export const SelectWithoutDescription = Template.bind({});
SelectWithoutDescription.args = { ...props, questionHintText: '' };

export const SelectWithDefaultValue = Template.bind({});
SelectWithDefaultValue.args = { ...props, defaultValue: 'Select' };

export const SelectWithErrors = Template.bind({});
SelectWithErrors.args = { ...props, fieldErrors: validationErrors };
