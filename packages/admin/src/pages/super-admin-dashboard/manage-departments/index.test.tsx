import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ManageDepartmentsPage from './index.page';

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
      <ManageDepartmentsPage departments={getMockDepartmentData()} userId="1" />
    );
    expect(screen.getByText('Back').getAttribute('href')).toBe(
      '/apply/super-admin-dashboard/user/1/change-department'
    );
  });
  test('Should navigate to dashboard when not provided a userId', async () => {
    render(
      <ManageDepartmentsPage departments={getMockDepartmentData()} userId="" />
    );
    expect(screen.getByText('Back').getAttribute('href')).toBe(
      '/apply/super-admin-dashboard/'
    );
  });
});
