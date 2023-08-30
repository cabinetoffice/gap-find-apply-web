import getConfig from 'next/config';
import React from 'react';

const CustomLink = ({
  href,
  dataCy,
  ariaLabel,
  customStyle,
  dataTestId,
  children,
  isButton,
  isSecondaryButton,
  isBackButton,
  disabled = false,
  excludeSubPath = false,
}: CustomLinkProps) => {
  const { publicRuntimeConfig } = getConfig();

  const buttonProps = {
    role: 'button',
    draggable: false,
    className: `govuk-button${
      isSecondaryButton ? ' govuk-button--secondary' : ''
    }`,
    'data-module': 'govuk-button',
    disabled: disabled,
  };

  const linkProps = {
    className: isBackButton ? 'govuk-back-link' : 'govuk-link',
  };

  const props = isButton || isSecondaryButton ? buttonProps : linkProps;

  if (typeof href === 'object') href = new URL(href).toString();

  return (
    <a
      href={
        disabled
          ? undefined
          : excludeSubPath
          ? href
          : `${publicRuntimeConfig.SUB_PATH}${href}`
      }
      data-cy={dataCy}
      data-testid={dataTestId}
      aria-label={ariaLabel}
      {...props}
      className={`${props.className}${customStyle ? ' ' + customStyle : ''}`}
      aria-disabled={disabled}
    >
      {isBackButton ? 'Back' : children}
    </a>
  );
};

type CustomLinkProps = {
  href: string;
  dataCy?: string;
  ariaLabel?: string;
  customStyle?: string;
  dataTestId?: string;
  excludeSubPath?: boolean;
} & AdditionalProps;

type AdditionalProps =
  | {
      //Link
      isButton?: false;
      isSecondaryButton?: false;
      isBackButton?: false;
      children: JSX.Element | string;
      disabled?: never;
    }
  | {
      //Standard button
      isButton: true;
      isSecondaryButton?: never;
      isBackButton?: never;
      children: JSX.Element | string;
      disabled?: boolean;
    }
  | {
      //Secondary button
      isSecondaryButton: true;
      isButton?: true | never;
      isBackButton?: never;
      children: JSX.Element | string;
      disabled?: boolean;
    }
  | {
      //Back button
      isBackButton: true;
      isButton?: never;
      isSecondaryButton?: never;
      children?: never;
      disabled?: never;
    };

export default CustomLink;
