import React, { FC } from 'react';

export enum ButtonTypePropertyEnum {
  Button = 'button',
  Reset = 'reset',
  Submit = 'submit',
}

export interface ButtonProps {
  text: string;
  isSecondary?: boolean;
  isWarning?: boolean;
  type?: ButtonTypePropertyEnum;
  addNameAttribute?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}

const Button: FC<ButtonProps> = ({
  text,
  isSecondary = false,
  isWarning = false,
  type,
  addNameAttribute = false,
  disabled = false,
  ariaLabel,
}) => {
  return (
    <button
      type={type}
      className={`govuk-button ${
        isSecondary ? 'govuk-button--secondary' : ''
      } ${isWarning ? 'govuk-button--warning' : ''}`}
      data-module="govuk-button"
      name={
        addNameAttribute ? text.toLowerCase().replace(/ /g, '-') : undefined
      } //save-and-exit (will be in the body of the post request sent to the server, so we know if we need to exit or continue)
      data-cy={`cy-button-${text}`}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
