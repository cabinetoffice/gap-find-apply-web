import React from 'react';
import { render } from '@testing-library/react';
import ViewEditors from './index.page';

const editorRows = [
  { key: 'Key1', value: 'Value1', action: 'Option1' },
  { key: 'Key2', value: 'Value2', action: 'Option2' },
];

test('renders ViewEditors without an action field', () => {
  const { getByText, queryByText } = render(
    <ViewEditors
      editorRows={editorRows}
      schemeName="Dummy Scheme"
      schemeId="dummySchemeId"
    />
  );

  expect(getByText('Dummy Scheme')).toBeVisible();
  expect(getByText('View editors')).toBeVisible();

  for (const row of editorRows) {
    expect(getByText(row.key)).toBeVisible();
    expect(getByText(row.value)).toBeVisible();
    expect(queryByText(row.action)).not.toBeInTheDocument;
  }
});
