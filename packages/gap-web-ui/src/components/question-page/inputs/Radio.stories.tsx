import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import Radio from './Radio';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'gap-web-ui/Radio',
  component: Radio,
} as ComponentMeta<typeof Radio>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Radio> = (args) => <Radio {...args} />;

export const YesNo = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
YesNo.args = {
  questionTitle: 'Page title',
  fieldErrors: [],
  fieldName: 'fieldName',
};

export const WithErrors = Template.bind({});
WithErrors.args = {
  questionTitle: 'Page title',
  fieldErrors: [{ fieldName: 'fieldName', errorMessage: 'Error Message' }],
  fieldName: 'fieldName',
};

export const WithDescription = Template.bind({});
WithDescription.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  fieldErrors: [],
  fieldName: 'fieldName',
};

export const WithDefaultRadioChecked = Template.bind({});
WithDefaultRadioChecked.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  // radioOptions?: string[];
  fieldErrors: [],
  defaultChecked: 'Yes',
  fieldName: 'fieldName',
};

export const WithDifferentRadioOptions = Template.bind({});
WithDifferentRadioOptions.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  radioOptions: [
    { label: 'Option1' },
    { label: 'Option2' },
    { label: 'Option3' },
    { label: 'Option4' },
    { label: 'Option5' },
  ],
  fieldErrors: [],
  defaultChecked: 'Yes',
  fieldName: 'fieldName',
};

export const WithOptionHints = Template.bind({});
WithOptionHints.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  radioOptions: [
    { label: 'Option1', hint: 'This is hint 1' },
    { label: 'Option2', hint: 'This is hint 2' },
    { label: 'Option3', hint: 'This is hint 3' },
    { label: 'Option4', hint: 'This is hint 4' },
    { label: 'Option5', hint: 'This is hint 5' },
  ],
  fieldErrors: [],
  defaultChecked: 'Yes',
  fieldName: 'fieldName',
};

export const WithOptionConditionalInputs = Template.bind({});
WithOptionConditionalInputs.args = {
  questionTitle: 'Page title',
  questionHintText: 'Description',
  defaultChecked: 'Option1',
  radioOptions: [
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

export const WithAnAlternativeOption = Template.bind({});
WithAnAlternativeOption.args = {
  questionTitle: 'Page title',
  fieldErrors: [],
  fieldName: 'fieldName',
  radioOptions: [{ label: 'Yes' }, { label: 'No' }, { label: 'Maybe? :O' }],
  divideLastRadioOption: true,
};
