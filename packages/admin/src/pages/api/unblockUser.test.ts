import { NextApiRequest, NextApiResponse } from 'next';
import { updateUserRoles } from '../../services/SuperAdminService';
import { getUserTokenFromCookies } from '../../utils/session';
import handler from './unblockUser.page';

jest.mock('../../services/SuperAdminService');
jest.mock('../../utils/session');

const mockUpdateUserRoles = updateUserRoles as jest.MockedFunction<
  typeof updateUserRoles
>;

const mockGetUserTokenFromCookies =
  getUserTokenFromCookies as jest.MockedFunction<
    typeof getUserTokenFromCookies
  >;

const mockNextApiResponse = {
  redirect: jest.fn(),
  end: jest.fn(),
} as unknown as NextApiResponse;

const mockNextApiRequest = {
  query: {
    id: '123',
  },
} as unknown as NextApiRequest;

describe('unblockUser', () => {
  test('should call updateUserRoles with correct params', async () => {
    mockGetUserTokenFromCookies.mockReturnValue('token');
    await handler(mockNextApiRequest, mockNextApiResponse);
    expect(mockUpdateUserRoles).toHaveBeenCalledWith(
      '123',
      ['1', '2'],
      'token'
    );
  });
  test('should call getUserTokenFromCookies with correct params', async () => {
    await handler(mockNextApiRequest, mockNextApiResponse);
    expect(mockGetUserTokenFromCookies).toHaveBeenCalledWith(
      mockNextApiRequest
    );
  });
  test('should call redirect with correct params', async () => {
    await handler(mockNextApiRequest, mockNextApiResponse);
    expect(mockNextApiResponse.redirect).toHaveBeenCalledWith(
      303,
      '/apply/admin/super-admin-dashboard/user/123'
    );
  });
  test('should call end', async () => {
    await handler(mockNextApiRequest, mockNextApiResponse);
    expect(mockNextApiResponse.end).toHaveBeenCalled();
  });
});
