import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../types/ValidationErrorType';
import ErrorBanner from './ErrorBanner';

export default {
  title: 'gap-web-ui/ErrorBanner',
  component: ErrorBanner,
} as ComponentMeta<typeof ErrorBanner>;

const Template: ComponentStory<typeof ErrorBanner> = (args) => (
  <ErrorBanner {...args} />
);

const validationErrors: ValidationError[] = [
  {
    fieldName: 'details',
    errorMessage: 'Please fill in required field',
  },
];

export const errorBanner = Template.bind({});
errorBanner.args = {
  fieldErrors: validationErrors,
};
