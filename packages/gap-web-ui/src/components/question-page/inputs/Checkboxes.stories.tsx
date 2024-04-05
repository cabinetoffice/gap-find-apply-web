import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import Checkboxes from './Checkboxes';

export default {
  title: 'gap-web-ui/Checkboxes',
  component: Checkboxes,
} as ComponentMeta<typeof Checkboxes>;

const Template: ComponentStory<typeof Checkboxes> = (args) => (
  <Checkboxes {...args} />
);

const options = ['British', 'Irish', 'Other'];
const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'nationality',
    errorMessage: 'Select an option',
  },
];

const props = {
  questionTitle: 'What is your nationality?',
  questionHintText:
    'If you have dual nationality, select all options that are relevant to you.',
  fieldName: 'nationality',
  options: options,
  fieldErrors: noValidationErrors,
};

export const checkboxesWithDescription = Template.bind({});
checkboxesWithDescription.args = { ...props };

export const checkboxesWithoutDescription = Template.bind({});
checkboxesWithoutDescription.args = { ...props, questionHintText: '' };

export const checkboxesWithErrors = Template.bind({});
checkboxesWithErrors.args = { ...props, fieldErrors: validationErrors };

export const checkboxesWithDefaultChecked = Template.bind({});
checkboxesWithDefaultChecked.args = {
  ...props,
  defaultCheckboxes: ['British'],
};

export const WithOptionConditionalInputs = Template.bind({});
WithOptionConditionalInputs.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  options: [
    {
      label: 'Option1',
      conditionalInput: (
        <>
          <label className="govuk-label" htmlFor="contact-by-email">
            Email address
          </label>
          <input
            className="govuk-input govuk-!-width-one-third"
            id="contact-by-email"
            name="contact-by-email"
            type="email"
            spellCheck="false"
            autoComplete="email"
          />
        </>
      ),
    },
    {
      label: 'Option2',
      conditionalInput: (
        <>
          <label className="govuk-label" htmlFor="contact-by-phone">
            Phone number
          </label>
          <input
            className="govuk-input govuk-!-width-one-third"
            id="contact-by-phone"
            name="contact-by-phone"
            type="tel"
            autoComplete="tel"
          />
        </>
      ),
    },
    {
      label: 'Option3',
      conditionalInput: (
        <>
          <label className="govuk-label" htmlFor="contact-by-text">
            Mobile phone number
          </label>
          <input
            className="govuk-input govuk-!-width-one-third"
            id="contact-by-text"
            name="contact-by-text"
            type="tel"
            autoComplete="tel"
          />
        </>
      ),
    },
  ],
  fieldErrors: [],
  fieldName: 'fieldName',
};

export const WithADivider = Template.bind({});
WithADivider.args = {
  questionTitle: 'Page title',
  fieldErrors: [],
  fieldName: 'fieldName',
  options: ['Yes', 'No', 'Maybe? :O'],
  divideLastCheckboxOption: true,
};

export const WithPartiallyDisabledCheckboxes = Template.bind({});
WithPartiallyDisabledCheckboxes.args = {
  ...props,
  disabledCheckboxes: ['British', 'Irish'],
};
