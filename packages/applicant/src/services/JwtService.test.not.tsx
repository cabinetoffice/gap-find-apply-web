//TODO: test is failing because of transpiling, come back at this later at some point. Iain veto on this :D

// import axios from 'axios';
// import MockAdapter from 'axios-mock-adapter';
// import { JwtPayload, verifyToken } from './JwtService';
// jest.mock('@vespaiach/axios-fetch-adapter');

// const verifyTokenUrl = `${process.env.APPLY_BACKEND_URL}/jwt/validate`;

// describe('Jwt service ', () => {
//   test('should first', () => {  })
// }
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('', () => {
//     it('should get organisation data through axios', async () => {
//       const spy = jest.spyOn(axios, 'post');
//       const mock = new MockAdapter(axios);

//       const headerMock = {
//         header: {
//           Authorization: 'jwt',
//         },
//       };
//       //   const mockConfig ={
//       //     adapter: jest.mock
//       //   }

//       const mockResponse: JwtPayload = {
//         sub: 'test',
//         lastLogin: 'test',
//         features: 'test',
//         iss: 'test',
//         cognitoUsername: 'test',
//         givenName: 'test',
//         aud: 'test',
//         eventId: 'test',
//         tokenUse: 'test',
//         phoneNumber: 'test',
//         authTime: 0,
//         exp: 0,
//         iat: 0,
//         familyName: 'test',
//         email: 'test',
//         isAdmin: 'test',
//       };
//       mock.onPost(verifyTokenUrl).reply(200, mockResponse);

//       const result = await verifyToken('jwt');

//       expect(result).toEqual(mockResponse);
//       expect(spy).toBeCalled();
//       expect(spy).toBeCalledWith(verifyTokenUrl, headerMock);
//     });
//   });
// });
