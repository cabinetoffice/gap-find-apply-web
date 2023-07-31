import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DeleteDapartmentPage from './index.page';

describe('Delete department page', () => {
  test('Shoud have the path variable of id', async () => {
    render(
      <DeleteDapartmentPage
        previousValues={{ _csrf: 'csrf' }}
        formAction="."
        pageData={{ id: '1' }}
        csrfToken="csrf"
        fieldErrors={[]}
      />
    );
    expect(screen.getByText('Delete department'));
  });
});
