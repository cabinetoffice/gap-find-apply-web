import React from 'react';
import { ErrorMessage } from '../../display-errors';
import { InputComponentProps } from './InputComponentProps';

const SelectInput = ({
  questionTitle,
  titleSize = 'l',
  boldHeading = true,
  questionHintText,
  fieldName,
  fieldErrors,
  selectOptions,
  defaultValue,
  disabled = false,
  TitleTag = 'h1',
}: SelectInputComponentProps) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );

  const firstOption = () => {
    if (!defaultValue) {
      return <option selected></option>;
    }

    if (
      selectOptions?.some((option) =>
        typeof option === 'string'
          ? option === defaultValue
          : option.value === defaultValue
      )
    ) {
      return '';
    }

    return <option selected>{defaultValue}</option>;
  };

  return (
    <>
      <div
        className={`govuk-form-group${
          hasError ? ' govuk-form-group--error' : ''
        }`}
        data-testid="select-input-component"
      >
        {!boldHeading ? (
          <label
            className="govuk-label"
            htmlFor={fieldName}
            data-cy={`cy-${fieldName}-question-title`}
          >
            {questionTitle}
          </label>
        ) : (
          <TitleTag className="govuk-label-wrapper">
            <label
              className={`govuk-label govuk-label--${titleSize}`}
              htmlFor={fieldName}
              data-cy={`cy-${fieldName}-question-title`}
            >
              {questionTitle}
            </label>
          </TitleTag>
        )}

        {questionHintText && (
          <div
            id={`${fieldName}-hint`}
            className="govuk-hint"
            data-cy={`cy-${fieldName}-question-hint`}
          >
            {questionHintText}
          </div>
        )}
        <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />

        <select
          className="govuk-select"
          id={fieldName}
          name={fieldName}
          data-cy={`cy-${fieldName}-select`}
          disabled={disabled}
        >
          {firstOption()}

          {selectOptions &&
            selectOptions.map((option, index) => {
              const isSelected =
                typeof option === 'string'
                  ? defaultValue === option
                  : defaultValue === option.value;
              return (
                <option
                  key={index}
                  value={typeof option === 'string' ? option : option.value}
                  selected={isSelected}
                >
                  {typeof option === 'string' ? option : option.label}
                </option>
              );
            })}
        </select>
      </div>
    </>
  );
};

export interface SelectInputComponentProps extends InputComponentProps {
  selectOptions?: string[] | { label: string; value: string }[];
  defaultValue?: string;
  disabled?: boolean;
}
export default SelectInput;
