import React from 'react';
import { InputType } from '../../types/InputType';
import { ValidationError } from '../../types/ValidationErrorType';
import { AddressInput, DateInput, Radio, UploadFile } from './inputs';
import Checkboxes from './inputs/Checkboxes';
import SelectInput from './inputs/SelectInput';
import TextArea from './inputs/TextArea';
import TextInput from './inputs/TextInput';

const InputController = ({
  questionTitle,
  questionHintText,
  fieldName,
  fieldErrors,
  inputType,
}: InputControllerProps) => {
  const { type, ...inputSpecificProps } = inputType;
  const inputProps = {
    questionTitle,
    questionHintText,
    fieldErrors,
    fieldName: fieldName,
    ...inputSpecificProps,
  };

  switch (type) {
    case 'text-input':
      return <TextInput {...inputProps} />;
    case 'text-area':
      return <TextArea {...inputProps} />;
    case 'checkboxes':
      return <Checkboxes {...inputProps} />;
    case 'select-input':
      return <SelectInput {...inputProps} />;
    case 'radio':
      return <Radio {...inputProps} />;
    case 'date':
      return <DateInput {...inputProps} />;
    case 'address':
      return <AddressInput {...inputProps} />;
    case 'upload':
      return <UploadFile {...inputProps} />;
  }
};
interface InputControllerProps {
  questionTitle: string;
  // eslint-disable-next-line no-undef
  questionHintText?: string | JSX.Element;
  fieldName: string;
  fieldErrors: ValidationError[];
  inputType: InputType;
}

export default InputController;
