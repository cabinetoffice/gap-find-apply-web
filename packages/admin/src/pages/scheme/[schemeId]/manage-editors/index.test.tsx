import React from 'react';
import { render } from '@testing-library/react';
import ManageEditors from './index.page';
import CustomLink from '../../../../components/custom-link/CustomLink';

jest.mock('../../../../components/custom-link/CustomLink');

describe('ManageEditors', () => {
  beforeEach(() => {
    (CustomLink as jest.MockedFunction<typeof CustomLink>).mockImplementation(
      ({ href, children }) => <a href={href}>{children}</a>
    );
  });

  test('Editor row', () => {
    const editorRows = [
      {
        key: 'Key1',
        value: 'Editor',
        action: { href: '/action1', ariaLabel: 'Action 1', label: 'Action 1' },
      },
    ];
    const { getByText, getByRole } = render(
      <ManageEditors
        editorRows={editorRows}
        schemeName="Dummy Scheme"
        schemeId="dummySchemeId"
      />
    );

    expect(getByText('Dummy Scheme')).toBeVisible();

    const headingElement = getByRole('heading', {
      name: /add or manage editors/i,
    });
    expect(headingElement).toBeVisible();

    expect(
      getByText('view, edit or delete any information entered for this grant')
    ).toBeVisible();
    expect(
      getByText('publish a grant advert or application form')
    ).toBeVisible();
    expect(getByText('download any submitted application forms')).toBeVisible();

    const actionLink1 = getByText('Action 1');
    expect(actionLink1).toHaveAttribute('href', '/action1');
    expect(actionLink1).toBeVisible();

    const addEditorLink = getByText('Add an editor');
    expect(addEditorLink).toHaveAttribute(
      'href',
      '/scheme/dummySchemeId/manage-editors/add-editor?schemeName=Dummy Scheme'
    );
    expect(addEditorLink).toBeVisible();

    const returnLink = getByText('Return to grant overview');
    expect(returnLink).toHaveAttribute('href', '/scheme/dummySchemeId/');
    expect(returnLink).toBeVisible();
  });

  test('Owner row', () => {
    const editorRows = [
      {
        key: 'Key1',
        value: 'Owner',
        action: { href: '/action1', ariaLabel: 'Action 1', label: 'Action 1' },
      },
    ];
    const { getByText, queryByText } = render(
      <ManageEditors
        editorRows={editorRows}
        schemeName="Dummy Scheme"
        schemeId="dummySchemeId"
      />
    );

    expect(queryByText('Action 1')).not.toBeInTheDocument();
    expect(getByText('-')).toBeVisible();
  });

  test('Banner visible when newEditor email in query param', () => {
    const { getByText } = render(
      <ManageEditors
        editorRows={[]}
        schemeName="Dummy Scheme"
        schemeId="dummySchemeId"
        newEditor="New Editor Name"
      />
    );

    const importantBanner = getByText(
      'New Editor Name has been added as an editor.'
    );
    expect(importantBanner).toBeVisible();
  });

  test('Banner not visible when newEditor email not in query param', () => {
    const { queryByText } = render(
      <ManageEditors
        editorRows={[]}
        schemeName="Dummy Scheme"
        schemeId="dummySchemeId"
      />
    );

    expect(
      queryByText('New Editor Name has been added as an editor.')
    ).not.toBeInTheDocument();
  });
});
