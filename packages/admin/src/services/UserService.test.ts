import axios from 'axios';
import UserDetails from '../types/UserDetails';
import { getLoggedInUsersDetails } from './UserService';

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
});
