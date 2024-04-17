import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import EditRoleWithId, { getServerSideProps } from './change-roles.page';
import { getContext } from 'gap-web-ui';
import {
  getUserById,
  updateUserRoles,
} from '../../../../services/SuperAdminService';
import { parseBody } from '../../../../utils/parseBody';
import { Department, User, Role } from '../../types';

jest.mock('../../../../services/SuperAdminService', () => ({
  getUserById: jest.fn(),
  getAllRoles: async () => getMockRoles({}),
  updateUserRoles: jest.fn(),
}));

jest.mock('../../../../utils/parseBody', () => ({
  parseBody: jest.fn(),
}));

const mockGetUserById = jest.mocked(getUserById);
const mockParseBody = jest.mocked(parseBody);

const defaultRoles = {
  find: true,
  apply: true,
  admin: true,
  superAdmin: true,
};

// Allows you to disable certain roles from being returned by passing e.g. getMockRoles({admin: false});
const getMockRoles = (roles: { [key: string]: boolean }) => {
  const rolesToRender = {
    ...defaultRoles,
    ...roles,
  };
  return [
    ...(rolesToRender.find
      ? [
          {
            id: '1',
            name: 'FIND',
            description: 'this is a description',
            label: 'Find',
          },
        ]
      : []),
    ...(rolesToRender.apply
      ? [
          {
            id: '2',
            name: 'APPLICANT',
            description: 'this is another description',
            label: 'Applicant',
          },
        ]
      : []),
    ...(rolesToRender.admin
      ? [
          {
            id: '3',
            name: 'ADMIN',
            description: 'this is another description',
            label: 'Administrator',
          },
        ]
      : []),
    ...(rolesToRender.superAdmin
      ? [
          {
            id: '4',
            name: 'SUPER_ADMIN',
            description: 'this is a super admin description',
            label: 'Super administrator',
          },
        ]
      : []),
  ];
};

const getMockUser = (
  roles: Role[] = getMockRoles({}),
  department: Department | null = null
): User => ({
  colaSub: '',
  gapUserId: '1',
  emailAddress: 'test@gmail.com',
  sub: 'testSub',
  roles: roles,
  department: department,
  created: 'now',
});
const renderComponent = (
  isOwner = false,
  roles = getMockRoles({}),
  fieldErrors = []
) => (
  <EditRoleWithId
    formAction="."
    pageData={{
      roles: getMockRoles({}),
      user: getMockUser(roles),
      userId: '1',
      isOwner,
    }}
    csrfToken="csrf"
    fieldErrors={fieldErrors}
    previousValues={{ newUserRoles: ['FIND', 'SUPER_ADMIN'] }}
  />
);

describe('Render edit role page', () => {
  beforeEach(jest.clearAllMocks);

  test('Should only check input roles which the queried user has', () => {
    //user has all roles (see component)
    render(renderComponent());
    expect(
      screen.getByText('Find').parentElement?.parentElement?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Super administrator').parentElement?.parentElement
        ?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Administrator').parentElement?.parentElement
        ?.previousSibling
    ).toBeChecked();
    expect(
      screen.getByText('Applicant').parentElement?.parentElement
        ?.previousSibling
    ).toBeChecked();
  });

  describe('disables Admin checkbox correctly', () => {
    const message =
      'While this user owns grants, you cannot demote them to an applicant.';
    const expectAdminNotDisabledAndNoMessage = () => {
      expect(screen.findAllByText(message)).not.toBeNull();
      expect(
        screen.getByText('Administrator').parentElement?.parentElement
          ?.previousSibling
      ).not.toBeDisabled();
    };

    test('SHOULD NOT disable the Administrator checkbox or render message if the user is an admin who DOES NOT own a scheme', () => {
      render(renderComponent());
      expectAdminNotDisabledAndNoMessage();
    });

    test('SHOULD NOT disable the Administrator checkbox or render message if the user owns a scheme but is not an admin', () => {
      render(
        renderComponent(true, getMockRoles({ admin: false, superAdmin: false }))
      );
      expectAdminNotDisabledAndNoMessage();
    });

    test('SHOULD NOT disable the Administrator checkbox or render message if the user does not own a scheme and is not an admin', () => {
      render(
        renderComponent(
          false,
          getMockRoles({ admin: false, superAdmin: false })
        )
      );
      expectAdminNotDisabledAndNoMessage();
    });

    test('SHOULD disable the Administrator checkbox and render message if the user is an admin who owns a scheme', () => {
      render(renderComponent(true, getMockRoles({ superAdmin: false })));
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(
        screen.getByText('Administrator').parentElement?.parentElement
          ?.previousSibling
      ).toBeDisabled();
    });
  });

  test('should render Error', () => {
    render(
      renderComponent(true, getMockRoles({}), [
        { fieldName: 'test', errorMessage: 'message' },
      ])
    );
    expect(
      screen.getByText('Error: Manage User - Change Roles')
    ).toBeInTheDocument();
  });
});

describe('getServerSideProps', () => {
  test('Should redirect to change department page as User who is being newly promoted to ADMIN', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: ['3', '4'] });
    mockGetUserById.mockResolvedValue(
      getMockUser(getMockRoles({ admin: false, superAdmin: false }))
    );
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(updateUserRoles).not.toBeCalled();
    expect(result).toEqual({
      redirect: {
        //new roles query param passed in to be used in change department page
        destination: `/super-admin-dashboard/user/1/change-department?newRoles=1,2,3,4`,
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account overview page as User who is being demoted from ADMIN to APPLICANT', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: undefined });
    mockGetUserById.mockResolvedValue(
      getMockUser(getMockRoles({ superAdmin: false }))
    );
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(updateUserRoles).toBeCalledWith('1', ['1', '2'], 'testJWT');
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account overview page as User who owns grants and is being demoted from SUPERADMIN to ADMIN', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: [] });
    mockGetUserById.mockResolvedValue(
      getMockUser(getMockRoles({}), {
        id: '1',
        name: 'Test Department',
      })
    );
    const getDefaultContext = () => ({
      params: { id: '1' },
      query: { isOwner: 'true' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(updateUserRoles).toBeCalledWith('1', ['1', '2', '3'], 'testJWT');
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });

  test('Should redirect to account page as ADMIN user (with a department) being promoted to SUPER ADMIN', async () => {
    mockParseBody.mockResolvedValue({ newUserRoles: ['4'] });
    mockGetUserById.mockResolvedValue(
      getMockUser(getMockRoles({ superAdmin: false }), {
        id: '1',
        name: 'Test Department',
      })
    );
    const getDefaultContext = () => ({
      params: { id: '1' },
      req: { method: 'POST' },
    });
    const result = await getServerSideProps(getContext(getDefaultContext));
    expect(updateUserRoles).toBeCalledWith(
      '1',
      ['1', '2', '3', '4'],
      'testJWT'
    );
    expect(result).toEqual({
      redirect: {
        destination: '/super-admin-dashboard/user/1',
        statusCode: 302,
      },
    });
  });
});
