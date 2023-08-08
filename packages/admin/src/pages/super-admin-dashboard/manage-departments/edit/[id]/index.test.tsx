import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EditDepartmentPage from './index.page';

const mockDepartmentData = {
  departmentName: 'spadmin-dept',
  ggisID: 'spadmin-gg',
};

describe('Edit department information page', () => {
  test('Should prefill form with department data', async () => {
    render(
      <EditDepartmentPage
        previousValues={mockDepartmentData}
        formAction="."
        pageData={mockDepartmentData}
        csrfToken="csrf"
        fieldErrors={[]}
      />
    );
    expect(screen.getByDisplayValue('spadmin-dept'));
    expect(screen.getByDisplayValue('spadmin-gg'));
  });
});
