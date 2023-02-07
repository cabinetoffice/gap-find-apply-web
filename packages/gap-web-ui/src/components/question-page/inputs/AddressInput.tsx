import React from 'react';
import { ValidationError } from '../../../types/ValidationErrorType';
import { InputComponentProps } from './InputComponentProps';
import TextInput from './TextInput';

const AddressInput = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  defaultAddressValues,
  hiddenValue,
}: AddressInputProps) => {
  const getFieldErrors = (fieldName: string): ValidationError[] => {
    const index = fieldErrors.findIndex(
      (error) => error.fieldName === fieldName
    );

    return index >= 0 ? [fieldErrors[index]] : [];
  };

  return (
    <fieldset className="govuk-fieldset">
      <legend
        className={`govuk-fieldset__legend govuk-fieldset__legend--${titleSize}`}
        data-testid="title-legend"
      >
        <h1
          className="govuk-fieldset__heading"
          data-cy={`cy-${fieldName}-question-title`}
        >
          {questionTitle}
        </h1>
      </legend>

      {questionHintText && (
        <div
          id={`${fieldName}-hint`}
          className="govuk-hint"
          data-cy={`cy-${fieldName}-question-hint`}
        >
          {questionHintText}
        </div>
      )}

      {hiddenValue && hiddenValue.length > 0 && (
        <input type="hidden" value={hiddenValue} name="id" />
      )}

      <TextInput
        questionTitle="Address line 1"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-address-line-1`}
        fieldErrors={getFieldErrors(`${fieldName}-address-line-1`)}
        defaultValue={defaultAddressValues?.addressLine1}
      />

      <TextInput
        questionTitle="Address line 2 (optional)"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-address-line-2`}
        fieldErrors={getFieldErrors(`${fieldName}-address-line-2`)}
        defaultValue={defaultAddressValues?.addressLine2}
      />

      <TextInput
        questionTitle="Town or City"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-town`}
        fieldErrors={getFieldErrors(`${fieldName}-town`)}
        defaultValue={defaultAddressValues?.town}
        width="20"
      />

      <TextInput
        questionTitle="County (optional)"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-county`}
        fieldErrors={getFieldErrors(`${fieldName}-county`)}
        defaultValue={defaultAddressValues?.county}
        width="20"
      />

      <TextInput
        questionTitle="Postcode"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-postcode`}
        fieldErrors={getFieldErrors(`${fieldName}-postcode`)}
        defaultValue={defaultAddressValues?.postcode}
        width="10"
      />
    </fieldset>
  );
};

export interface AddressInputProps extends InputComponentProps {
  defaultAddressValues?: DefaultAddressValueType;
  hiddenValue?: string;
}

export interface DefaultAddressValueType {
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postcode?: string;
}

export default AddressInput;
