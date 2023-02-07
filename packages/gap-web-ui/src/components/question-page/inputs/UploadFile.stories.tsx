import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { ValidationError } from '../../../types';
import UploadFile from './UploadFile';

export default {
  title: 'gap-web-ui/UploadFile',
  component: UploadFile,
} as ComponentMeta<typeof UploadFile>;

const Template: ComponentStory<typeof UploadFile> = (args) => (
  <UploadFile {...args} />
);

const noValidationErrors: ValidationError[] = [];
const validationError: ValidationError = {
  fieldName: 'file',
  errorMessage: 'Please choose a file',
};

const validationErrors: ValidationError[] = [validationError];

const props = {
  questionTitle: 'Please upload your Birth certificate?',
  questionHintText: 'Please send us your Birth certificate',
  fieldName: 'file',
  fieldErrors: noValidationErrors,
};

export const UploadFileWithDescription = Template.bind({});
UploadFileWithDescription.args = { ...props };

export const UploadFileWithoutDescription = Template.bind({});
UploadFileWithoutDescription.args = { ...props, questionHintText: '' };

export const UploadFileWithError = Template.bind({});
UploadFileWithError.args = { ...props, fieldErrors: validationErrors };

export const UploadFileWithUploadedFile = Template.bind({});
UploadFileWithUploadedFile.args = {
  ...props,
  uploadedFile: {
    name: 'BirthCertificate.pdf',
    removeBaseUrl: '/test',
    id: '1234',
  },
};
