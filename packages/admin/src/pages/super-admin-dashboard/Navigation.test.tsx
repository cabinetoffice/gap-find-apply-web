import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Navigation from './Navigation';
import { Role } from './types';

jest.mock('next/config', () => () => ({
  publicRuntimeConfig: {
    FIND_A_GRANT_URL: 'mocked-find-a-grant-url',
    APPLICANT_DOMAIN: 'mocked-applicant-domain',
    TECHNICAL_SUPPORT_DOMAIN: 'mocked-technical-support-domain',
  },
}));

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
    const { getByText } = render(<Navigation roles={roles} />);

    expect(getByText('Home')).toBeInTheDocument();
    expect(getByText('Manage users')).toBeInTheDocument();
    expect(getByText('Admin dashboard')).toBeInTheDocument();
    expect(getByText('Applicant dashboard')).toBeInTheDocument();
    expect(getByText('Manage API Keys')).toBeInTheDocument();
  });

  it('does not render "Manage API Keys" link for non-TECHNICAL_SUPPORT roles', () => {
    const { queryByText } = render(<Navigation roles={roles.slice(0, 1)} />);

    const technicalSupportDashboardLink = queryByText('Manage API Keys');
    expect(technicalSupportDashboardLink).toBeNull();
  });
});
