import React from 'react';
import { ErrorMessage } from '../../display-errors';
import { InputComponentProps } from './InputComponentProps';
import styles from './Checkboxes.module.scss';

const Checkboxes = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  options,
  defaultCheckboxes,
  disabled = false,
  divideLastCheckboxOption = false,
  divideCheckboxIndex = options ? options.length - 1 : 1,
  TitleTag = 'h1',
  newLineAccepted = false,
  small = false,
  useOptionValueAsInputValue,
}: CheckboxesProps) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );
  const newLineClass = newLineAccepted ? ` gap-new-line` : '';

  return (
    <div
      className={`govuk-form-group${
        hasError ? ' govuk-form-group--error' : ''
      }`}
      data-testid="checkbox-component"
    >
      <fieldset
        className="govuk-fieldset"
        aria-describedby={questionHintText ? `${fieldName}-hint` : undefined}
      >
        <legend
          className={`govuk-fieldset__legend govuk-fieldset__legend--${titleSize} ${
            small ? styles['no-margin-bottom'] : ''
          }`}
          data-testid="title-legend"
        >
          <TitleTag className="govuk-label-wrapper">
            <label
              className={`govuk-label govuk-label--${titleSize} ${
                small ? styles['no-margin-bottom'] : ''
              }`}
              data-cy={`cy-${fieldName}-question-title`}
            >
              {questionTitle}
            </label>
          </TitleTag>
        </legend>

        {questionHintText && (
          <div
            id={`${fieldName}-hint`}
            className={`govuk-hint${newLineClass}`}
            data-cy={`cy-${fieldName}-question-hint`}
          >
            {questionHintText}
          </div>
        )}
        {hasError && (
          <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />
        )}
        <div
          className={
            small
              ? 'govuk-checkboxes govuk-checkboxes--small'
              : 'govuk-checkboxes'
          }
          data-module="govuk-checkboxes"
        >
          {options &&
            options.map((option, index) => {
              const value =
                typeof option === 'string'
                  ? option
                  : typeof option.label === 'string' &&
                    !useOptionValueAsInputValue
                  ? option.label
                  : (option.value as string);

              const getDataBehaviour = () => {
                if (!divideLastCheckboxOption) return undefined;
                if (divideCheckboxIndex === 1 && index === 0)
                  return 'exclusive';
                if (
                  divideCheckboxIndex === options.length - 1 &&
                  index === options.length - 1
                )
                  return 'exclusive';
                return undefined;
              };

              return (
                <React.Fragment key={value}>
                  {divideLastCheckboxOption &&
                    index === divideCheckboxIndex && (
                      <div className="govuk-checkboxes__divider">or</div>
                    )}

                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id={index === 0 ? fieldName : `${fieldName}-${index + 1}`}
                      name={fieldName}
                      type="checkbox"
                      value={value}
                      defaultChecked={
                        defaultCheckboxes &&
                        defaultCheckboxes.indexOf(value as string) >= 0
                      }
                      disabled={disabled}
                      data-behaviour={getDataBehaviour()}
                      data-cy={`cy-checkbox-value-${value}`}
                      data-aria-controls={
                        typeof option === 'object' && option.conditionalInput
                          ? `conditional-${
                              index === 0
                                ? fieldName
                                : `${fieldName}-${index + 1}`
                            }`
                          : undefined
                      }
                    />
                    <label
                      className="govuk-label govuk-checkboxes__label"
                      htmlFor={
                        index === 0 ? fieldName : `${fieldName}-${index + 1}`
                      }
                      data-cy={`cy-checkbox-label-${value}`}
                    >
                      {typeof option === 'string' ? value : option.label}
                    </label>
                  </div>

                  {typeof option === 'object' && option.conditionalInput && (
                    <div
                      className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden"
                      id={`conditional-${
                        index === 0 ? fieldName : `${fieldName}-${index + 1}`
                      }`}
                      data-testid={`conditional-input-wrapper-${index + 1}`}
                    >
                      <div className="govuk-form-group">
                        {option.conditionalInput}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
        </div>
      </fieldset>
    </div>
  );
};

type CheckboxOption =
  | {
      label: string;
      value?: string;
      conditionalInput?: JSX.Element;
    }
  | {
      label: JSX.Element;
      value: string;
      conditionalInput?: JSX.Element;
    };

export interface CheckboxesProps extends InputComponentProps {
  options?: string[] | CheckboxOption[];
  defaultCheckboxes?: string[];
  disabled?: boolean;
  divideLastCheckboxOption?: boolean;
  divideCheckboxIndex?: number;
  newLineAccepted?: boolean;
  small?: boolean;
  useOptionValueAsInputValue?: boolean;
}

export default Checkboxes;
