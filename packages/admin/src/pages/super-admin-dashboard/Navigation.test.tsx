import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Navigation from './Navigation';
import { Role } from './types';

const roles: Role[] = [
  { name: 'ADMIN', id: '1', description: 'adminRole', label: 'adminLabel' },
  {
    name: 'TECHNICAL_SUPPORT',
    id: '2',
    description: 'technicalSupportRole',
    label: 'technicalSupportLabel',
  },
];

describe('Navigation', () => {
  it('renders navigation items correctly when TECHNICAL_SUPPORT role is present in the roles', () => {
    const { getByRole } = render(<Navigation roles={roles} />);

    expect(getByRole('link', { name: 'Home' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage users' })).toBeVisible();
    expect(getByRole('link', { name: 'Admin dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Applicant dashboard' })).toBeVisible();
    expect(getByRole('link', { name: 'Manage API Keys' })).toBeVisible();
  });

  it('does not render "Manage API Keys" link for non-TECHNICAL_SUPPORT roles', () => {
    const { queryByText } = render(<Navigation roles={roles.slice(0, 1)} />);

    const technicalSupportDashboardLink = queryByText('Manage API Keys');
    expect(technicalSupportDashboardLink).toBeNull();
  });
});
