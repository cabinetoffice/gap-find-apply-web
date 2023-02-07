import { FC } from 'react';

export enum ButtonTypePropertyEnum {
  Button = 'button',
  Reset = 'reset',
  Submit = 'submit',
}
export interface ButtonType {
  name: string;
  isSecondary?: boolean;
  type?: ButtonTypePropertyEnum;
}

export const Button: FC<ButtonType> = ({
  name,
  isSecondary = false,
  type = ButtonTypePropertyEnum.Button,
}) => {
  return (
    <>
      {name && (
        <button
          type={type}
          className={
            'govuk-button ' + (isSecondary ? 'govuk-button--secondary' : '')
          }
          data-module="govuk-button"
          data-cy={`cy-button-${type}-${name}`}
        >
          {name}
        </button>
      )}
    </>
  );
};
