import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../types';
import { InputType } from '../../types/InputType';
import { ButtonProps } from './inputs/Button';
import QuestionPageLayout from './QuestionPageLayout';

export default {
  title: 'gap-web-ui/QuestionPageLayout',
  component: QuestionPageLayout,
} as ComponentMeta<typeof QuestionPageLayout>;

const Template: ComponentStory<typeof QuestionPageLayout> = (args) => (
  <QuestionPageLayout {...args} />
);

const noValidationErrors: ValidationError[] = [];

const validationErrors: ValidationError[] = [
  {
    fieldName: 'org-name',
    errorMessage: 'Complete required fields',
  },
];

const dateValidationErrors: ValidationError[] = [
  {
    fieldName: 'date-month',
    errorMessage: 'Invalid Month',
  },
];

const addressValidationErrors: ValidationError[] = [
  {
    fieldName: 'org-address-address-line-1',
    errorMessage: 'You must enter an answer',
  },
  {
    fieldName: 'org-address-address-line-2',
    errorMessage: 'Answer must be 250 characters or less',
  },
];
const uploadValidationErrors: ValidationError[] = [
  {
    fieldName: 'file',
    errorMessage: 'Please choose a file',
  },
];

const textAreaInputType: InputType = {
  type: 'text-area',
  defaultValue: '',
};

const textInputInputType: InputType = {
  type: 'text-input',
  defaultValue: '',
};

const checkboxInputType: InputType = {
  type: 'checkboxes',
  options: ['British', 'Irish', 'Other'],
};

const radioInputType: InputType = {
  type: 'radio',
  radioOptions: [{ label: 'Yes' }, { label: 'Defo' }],
};

const selectInputType: InputType = {
  type: 'select-input',
  selectOptions: ['Competed grant', 'Criteria grant', 'Emergency grant'],
};

const dateInputType: InputType = {
  type: 'date',
};

const button: ButtonProps = {
  text: 'Save and cancel',
};

const addressInputType: InputType = {
  type: 'address',
  hiddenValue: 'org-value',
};

const uploadInputType: InputType = {
  type: 'upload',
};

export const TextArea = Template.bind({});
TextArea.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's name",
  questionHintText: 'Provide the legal name of your organisation',
  fieldName: 'org-name',
  inputType: textAreaInputType,
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const TextAreaWithPageCaption = Template.bind({});
TextAreaWithPageCaption.args = {
  formAction: '/',
  pageCaption: 'Construction grant application form',
  questionTitle: "Enter your organisation's name",
  questionHintText: 'Provide the legal name of your organisation',
  fieldName: 'org-name',
  inputType: textAreaInputType,
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const TextAreaWithErrors = Template.bind({});
TextAreaWithErrors.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's name",
  questionHintText: 'Provide the legal name of your organisation',
  fieldName: 'org-name',
  inputType: textAreaInputType,
  fieldErrors: validationErrors,
  buttons: [button],
};

export const TextInput = Template.bind({});
TextInput.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's name",
  questionHintText: 'Provide the legal name of your organisation',
  fieldName: 'org-name',
  inputType: textInputInputType,
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const TextInputWithErrors = Template.bind({});
TextInputWithErrors.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's name",
  questionHintText: 'Provide the legal name of your organisation',
  fieldName: 'org-name',
  inputType: textInputInputType,
  fieldErrors: validationErrors,
  buttons: [button],
};

export const Radio = Template.bind({});
Radio.args = {
  formAction: '/',
  questionTitle: 'Are you awesome?',
  questionHintText: 'Please select',
  fieldName: 'org-name',
  inputType: radioInputType,
  fieldErrors: noValidationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const RadioWithErrors = Template.bind({});
RadioWithErrors.args = {
  formAction: '/',
  questionTitle: 'Are you awesome?',
  questionHintText: 'Please select',
  fieldName: 'org-name',
  inputType: radioInputType,
  fieldErrors: validationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const Checkboxes = Template.bind({});
Checkboxes.args = {
  formAction: '/',
  questionTitle: 'What is your nationality?',
  questionHintText:
    'If you have dual nationality, select all options that are relevant to you.',
  fieldName: 'org-name',
  inputType: checkboxInputType,
  fieldErrors: noValidationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const CheckboxesWithErrors = Template.bind({});
CheckboxesWithErrors.args = {
  formAction: '/',
  questionTitle: 'What is your nationality?',
  questionHintText:
    'If you have dual nationality, select all options that are relevant to you.',
  fieldName: 'org-name',
  inputType: checkboxInputType,
  fieldErrors: validationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const Select = Template.bind({});
Select.args = {
  formAction: '/',
  questionTitle: 'What type of grant are you looking for?',
  questionHintText: 'Select grant type',
  fieldName: 'org-name',
  inputType: selectInputType,
  fieldErrors: noValidationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const SelectWithErrors = Template.bind({});
SelectWithErrors.args = {
  formAction: '/',
  questionTitle: 'What type of grant are you looking for?',
  questionHintText: 'Select grant type',
  fieldName: 'org-name',
  inputType: selectInputType,
  fieldErrors: validationErrors,
  buttons: [button, { text: 'Save and exit', isSecondary: true }],
};

export const Date = Template.bind({});
Date.args = {
  formAction: '/',
  questionTitle: 'Enter your birthDay',
  questionHintText: 'Provide your birthday',
  fieldName: 'date',
  inputType: dateInputType,
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const DateWithErrors = Template.bind({});
DateWithErrors.args = {
  formAction: '/',
  questionTitle: 'Enter your birthDay',
  questionHintText: 'Provide your birthday',
  fieldName: 'date',
  inputType: {
    ...dateInputType,
    defaultValues: { day: '40', month: '14', year: '2000' },
  },
  fieldErrors: dateValidationErrors,
  buttons: [button],
};

export const AddressInput = Template.bind({});
AddressInput.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's address",
  questionHintText: 'Provide the address of your organisation',
  fieldName: 'org-address',
  inputType: addressInputType,
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const AddressInputWithErrors = Template.bind({});
AddressInputWithErrors.args = {
  formAction: '/',
  questionTitle: "Enter your organisation's address",
  questionHintText: 'Provide the address of your organisation',
  fieldName: 'org-address',
  inputType: addressInputType,
  fieldErrors: addressValidationErrors,
  buttons: [button],
};

export const UploadWithoutErrors = Template.bind({});
UploadWithoutErrors.args = {
  formAction: '/',
  questionTitle: 'Upload your birth certificate',
  questionHintText: 'Please attach your birth certificate',
  fieldName: 'file',
  inputType: {
    ...uploadInputType,
  },
  fieldErrors: noValidationErrors,
  buttons: [button],
};

export const UploadWithErrors = Template.bind({});
UploadWithErrors.args = {
  formAction: '/',
  questionTitle: 'Upload your birth certificate',
  questionHintText: 'Please attach your birth certificate',
  fieldName: 'file',
  inputType: {
    ...uploadInputType,
  },
  fieldErrors: uploadValidationErrors,
  buttons: [button],
};

export const UploadWithoutErrorsAndFileSelected = Template.bind({});
UploadWithoutErrorsAndFileSelected.args = {
  formAction: '/',
  questionTitle: 'Upload your birth certificate',
  questionHintText: 'Please attach your birth certificate',
  fieldName: 'file',
  inputType: {
    ...uploadInputType,
    uploadedFile: { name: 'File.pdf', removeBaseUrl: '/test', id: '1234' },
  },
  fieldErrors: noValidationErrors,
  buttons: [button],
};
