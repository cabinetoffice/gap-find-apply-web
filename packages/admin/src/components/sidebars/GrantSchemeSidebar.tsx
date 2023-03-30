import React from 'react';
import CustomLink from '../custom-link/CustomLink';

const GrantSchemeSidebar = () => {
  return (
    <div
      className="govuk-grid-column-one-third"
      data-testid="create-new-grant-scheme-sidebar"
    >
      <h2
        className="govuk-heading-m govuk-!-margin-bottom-1"
        data-cy="cy_sidebar_header_add_a_grant"
      >
        Add a grant
      </h2>
      <p
        className="govuk-body border-top border-colour-blue border-2"
        data-cy="cy_sidebar_description_add_a_grant"
      >
        Create and customise a grant for your applicants.
      </p>
      <CustomLink href="/new-scheme/name" isButton dataCy="cy_addAGrantButton">
        Add a grant
      </CustomLink>
    </div>
  );
};

export default GrantSchemeSidebar;
