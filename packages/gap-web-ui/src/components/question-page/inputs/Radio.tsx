import { startCase, toLower } from 'lodash';
import React, { FC } from 'react';
import { RadioOption } from '../../../types/InputType';
import { ErrorMessage } from '../../display-errors';
import { InputComponentProps } from './InputComponentProps';

const Radio: FC<RadioProps> = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  fieldErrors,
  radioOptions = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ],
  defaultChecked,
  disabled = false,
  divideLastRadioOption = false,
  TitleTag = 'h1',
}) => {
  const hasError = fieldErrors.some((fieldError) =>
    fieldError.fieldName.startsWith(fieldName)
  );

  return (
    <div
      className={`govuk-form-group${
        hasError ? ' govuk-form-group--error' : ''
      }`}
      data-testid="radioFormDiv"
    >
      <fieldset
        className="govuk-fieldset"
        aria-describedby={hasError ? `${fieldName}-error` : `${fieldName}`}
      >
        <legend
          className={`govuk-fieldset__legend govuk-fieldset__legend--${titleSize}`}
          data-testid="title-legend"
        >
          <TitleTag
            className="govuk-fieldset__heading"
            data-cy={`cy-${fieldName}-question-title`}
          >
            {questionTitle}
          </TitleTag>
        </legend>
        {questionHintText && (
          <div
            id={`radio-hint`}
            className="govuk-hint"
            data-cy={`cy-${fieldName}-question-hint`}
          >
            {questionHintText}
          </div>
        )}
        {hasError && (
          <ErrorMessage fieldErrors={fieldErrors} fieldName={fieldName} />
        )}
        <div
          className="govuk-radios"
          data-module="govuk-radios"
          data-testid="radioGroupDiv"
        >
          {radioOptions.map((radioOption, index) => {
            const formattedRadioOptionLabel = startCase(
              toLower(radioOption.label)
            ).replace(/ /g, '');

            return (
              <React.Fragment key={formattedRadioOptionLabel}>
                {divideLastRadioOption && index === radioOptions.length - 1 && (
                  <div className="govuk-radios__divider">or</div>
                )}
                <div className="govuk-radios__item">
                  <input
                    className="govuk-radios__input"
                    id={
                      index === 0 ? `${fieldName}` : `${fieldName}-${index + 1}`
                    }
                    name={fieldName}
                    type="radio"
                    value={radioOption.value || formattedRadioOptionLabel}
                    defaultChecked={radioOption.label === defaultChecked}
                    aria-describedby={
                      radioOption.hint
                        ? `${
                            index === 0
                              ? fieldName
                              : `${fieldName}-${index + 1}`
                          }-hint`
                        : undefined
                    }
                    data-aria-controls={
                      radioOption.conditionalInput
                        ? `conditional-${
                            index === 0
                              ? fieldName
                              : `${fieldName}-${index + 1}`
                          }`
                        : undefined
                    }
                    data-cy={`cy-radioInput-option-${formattedRadioOptionLabel}`}
                    disabled={disabled}
                  />

                  <label
                    className="govuk-label govuk-radios__label"
                    htmlFor={
                      index === 0 ? `${fieldName}` : `${fieldName}-${index + 1}`
                    }
                    data-cy={`cy-radioInput-label-${formattedRadioOptionLabel}`}
                  >
                    {radioOption.label}
                  </label>

                  {radioOption.hint && (
                    <div
                      id={`${
                        index === 0 ? fieldName : `${fieldName}-${index + 1}`
                      }-hint`}
                      className="govuk-hint govuk-radios__hint"
                      data-testid={`hint-wrapper-${index + 1}`}
                    >
                      {radioOption.hint}
                    </div>
                  )}

                  {radioOption.conditionalInput && (
                    <div
                      className="govuk-radios__conditional govuk-radios__conditional--hidden"
                      id={`conditional-${
                        index === 0 ? fieldName : `${fieldName}-${index + 1}`
                      }`}
                      data-testid={`conditional-input-wrapper-${index + 1}`}
                    >
                      <div className="govuk-form-group">
                        {radioOption.conditionalInput}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
};

export interface RadioProps extends InputComponentProps {
  radioOptions?: RadioOption[];
  defaultChecked?: string;
  disabled?: boolean;
  divideLastRadioOption?: boolean;
  TitleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default Radio;
