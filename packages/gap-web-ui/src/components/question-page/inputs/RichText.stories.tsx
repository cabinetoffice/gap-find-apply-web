import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import RichText from './RichText';

export default {
  title: 'gap-web-ui/RichText',
  component: RichText,
} as ComponentMeta<typeof RichText>;

const Template: ComponentStory<typeof RichText> = (args) => (
  <RichText {...args} />
);

export const WithDescription = Template.bind({});
WithDescription.args = {
  questionTitle: 'Can you provide more detail?',
  questionHintText:
    'Do not include personal or financial information, like your National Insurance number or credit card details',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: [],
  isJsEnabled: true,
};

export const WithError = Template.bind({});
WithError.args = {
  questionTitle: 'Can you provide more detail?',
  questionHintText:
    'Do not include personal or financial information, like your National Insurance number or credit card details',
  fieldName: 'details',
  defaultValue: '',
  fieldErrors: [
    {
      fieldName: 'details',
      errorMessage: 'Too many characters.',
    },
  ],
  isJsEnabled: true,
};
