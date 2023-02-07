import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import AddressInput from './AddressInput';

export default {
  title: 'gap-web-ui/AddressInput',
  component: AddressInput,
} as ComponentMeta<typeof AddressInput>;

const Template: ComponentStory<typeof AddressInput> = (args) => (
  <AddressInput {...args} />
);
const noValidationErrors: ValidationError[] = [];
const validationErrors: ValidationError[] = [
  {
    fieldName: 'org-address-address-line-1',
    errorMessage: 'You must enter an answer',
  },
  {
    fieldName: 'org-address-address-line-2',
    errorMessage: 'Answer must be 250 characters or less',
  },
  {
    fieldName: 'org-address-town',
    errorMessage: 'Answer must be 250 characters or less',
  },
  {
    fieldName: 'org-address-county',
    errorMessage: 'Answer must be 250 characters or less',
  },
  {
    fieldName: 'org-address-postcode',
    errorMessage: 'Answer must be 1 character or more',
  },
];

const defaultAddressValues = {
  addressLine1: 'First Line',
  addressLine2: 'Second Line',
  town: 'Edinburgh',
  county: 'Lothian',
  postcode: 'EH22 2TH',
};

const props = {
  questionTitle: "Enter your organisation's address",
  fieldName: 'org-address',
  fieldErrors: noValidationErrors,
};

export const AddressInputComponent = Template.bind({});
AddressInputComponent.args = { ...props };

export const AddressInputWithErrors = Template.bind({});
AddressInputWithErrors.args = { ...props, fieldErrors: validationErrors };

export const AddressInputWithDefaultValues = Template.bind({});
AddressInputWithDefaultValues.args = {
  ...props,
  defaultAddressValues: defaultAddressValues,
};
