import axios from 'axios';
import UserDetails from '../types/UserDetails';
import {
  checkNewAdminEmailIsValid,
  getLoggedInUsersDetails,
} from './UserService';

const BASE_USERS_URL = process.env.BACKEND_HOST + '/users';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockedUserDetails: UserDetails = {
  firstName: 'First',
  lastName: 'Last',
  organisationName: 'Testing Corp',
};

beforeEach(() => {
  jest.resetAllMocks();
});

describe('userService', () => {
  it('Should return a UserDetails object from the logged in users session', async () => {
    mockedAxios.get.mockResolvedValue({ data: mockedUserDetails });

    const result = await getLoggedInUsersDetails('testSessionId');
    expect(mockedAxios.get).toHaveBeenCalledWith(
      BASE_USERS_URL + '/loggedInUser',
      {
        headers: { Cookie: 'SESSION=testSessionId;' },
        withCredentials: true,
      }
    );
    expect(result).toStrictEqual(mockedUserDetails);
  });

  describe('checkNewAdminEmailIsValid function', () => {
    it('Should call relevant endpoint with correct params', async () => {
      mockedAxios.post.mockResolvedValue({ data: true });

      const result = await checkNewAdminEmailIsValid(
        'testSessionId',
        'testJwt',
        'testEmail'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        BASE_USERS_URL + '/validate-admin-email',
        { emailAddress: 'testEmail' },
        {
          withCredentials: true,
          headers: {
            Cookie: 'SESSION=testSessionId;user-service-token=testJwt',
          },
        }
      );
      expect(result).toStrictEqual(true);
    });
  });
});
