import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import EditDepartmentPage from './index.page';
import ManageDepartmentsPage from './index.page';
import { Department } from '../types';

const getMockDepartmentData = () => [
  {
    id: '1',
    name: 'spadmin-dept',
    ggisID: 'spadmin-gg',
  },
  {
    id: '0',
    name: 'spadmin-dept2',
    ggisID: 'spadmin-gg2',
  },
];

describe('Edit department information page', () => {
  test('Should navigate to change user department when provided a userId', async () => {
    render(
      <ManageDepartmentsPage
        formAction="."
        pageData={{ departments: getMockDepartmentData(), userId: '1' }}
        previousValues={getMockDepartmentData()[0]}
        csrfToken="csrf"
        fieldErrors={[]}
      />
    );
    expect(screen.getByText('Back').getAttribute('href')).toBe(
      '/apply/super-admin-dashboard/user/1/change-department'
    );
  });
  test('Should navigate to dashboard when not provided a userId', async () => {
    render(
      <ManageDepartmentsPage
        formAction="."
        pageData={{ departments: getMockDepartmentData(), userId: '' }}
        previousValues={getMockDepartmentData()[0]}
        csrfToken="csrf"
        fieldErrors={[]}
      />
    );
    expect(screen.getByText('Back').getAttribute('href')).toBe(
      '/apply/super-admin-dashboard/'
    );
  });
});
