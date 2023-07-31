import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AddDepartmentPage from './index.page';

const mockDepartmentData = {
  name: 'spadmin-dept',
  ggisID: 'spadmin-gg',
  jwt: 'jwt',
};

describe('Add department page', () => {
  test('Should not prefill form with department data', async () => {
    render(
      <AddDepartmentPage
        previousValues={mockDepartmentData}
        formAction="."
        pageData={mockDepartmentData}
        csrfToken="csrf"
        fieldErrors={[]}
      />
    );
    expect(screen.queryByDisplayValue('spadmin-dept')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('spadmin-gg')).not.toBeInTheDocument();
  });
});
