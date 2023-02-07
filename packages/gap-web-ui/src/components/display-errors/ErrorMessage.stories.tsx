import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../types';
import ErrorMessage from './ErrorMessage';

export default {
  title: 'gap-web-ui/ErrorMessage',
  component: ErrorMessage,
} as ComponentMeta<typeof ErrorMessage>;

const Template: ComponentStory<typeof ErrorMessage> = (args) => (
  <ErrorMessage {...args} />
);

const validationErrors: ValidationError[] = [
  {
    fieldName: 'details',
    errorMessage: 'Please fill in required field',
  },
];

export const errorMessage = Template.bind({});
errorMessage.args = {
  fieldName: 'details',
  fieldErrors: validationErrors,
};
