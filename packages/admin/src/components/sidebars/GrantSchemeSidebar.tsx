import React from 'react';
import CustomLink from '../custom-link/CustomLink';

const GrantSchemeSidebar = () => {
  return (
    <div
      className="govuk-grid-column-one-third"
      data-testid="create-new-grant-scheme-sidebar"
    >
      <p className="govuk-body border-top border-colour-blue border-2">
        Add a grant to your account.
      </p>
      <CustomLink href="/new-scheme/name" isButton dataCy="cy_addAGrantButton">
        Add a grant
      </CustomLink>
    </div>
  );
};

export default GrantSchemeSidebar;
