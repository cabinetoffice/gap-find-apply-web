import { FC } from 'react';
import { Button, ButtonType, ButtonTypePropertyEnum } from '../button/Button';
import { GovLink, LinkType } from '../link/GovLink';

export interface ButtonGroupType {
  saveButton: ButtonType;
  cancelLink?: LinkType;
  type?: ButtonTypePropertyEnum;
}

export const SaveAndCancel: FC<ButtonGroupType> = ({
  saveButton,
  cancelLink = null,
  type,
}) => {
  return (
    <div className="govuk-button-group">
      <Button
        name={saveButton.name}
        isSecondary={saveButton.isSecondary}
        type={type || undefined}
      />
      {cancelLink && (
        <GovLink
          text={cancelLink.text}
          url={cancelLink.url}
          noVisitedState={cancelLink.noVisitedState}
          data-cy="cy-Link-Cancel"
        />
      )}
    </div>
  );
};
