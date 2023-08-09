import axios from 'axios';

const wireMockBaseUrl = 'http://localhost:8888/__admin';

const userStubResponseMappings = {
  applicant: 'onelogin-applicant-userinfo-response-get.json',
  admin: 'onelogin-admin-userinfo-response-get.json',
  superAdmin: 'onelogin-super-admin-userinfo-response-get.json',
};

export const createUserInfoStub = async (user) => {
  const file = userStubResponseMappings[user];

  const userInfoStub = {
    request: {
      method: 'GET',
      url: '/userinfo',
    },
    response: {
      status: 200,
      bodyFileName: file,
      headers: {
        'Content-Type': 'text/plain',
      },
    },
  };

  try {
    const response = await axios.get(`${wireMockBaseUrl}/mappings`);
    const existingMappings = response.data.mappings;

    const existingMapping = existingMappings.find(
      (mapping) =>
        mapping.request.url === userInfoStub.request.url &&
        mapping.request.method === userInfoStub.request.method
    );

    if (existingMapping) {
      const existingMappingId = existingMapping.id;
      await axios.put(
        `${wireMockBaseUrl}/mappings/${existingMappingId}`,
        userInfoStub
      );
      console.log(
        `Existing WireMock mapping with ID ${existingMappingId} updated.`
      );
    } else {
      const createResponse = await axios.post(
        `${wireMockBaseUrl}/mappings`,
        userInfoStub
      );
      console.log('New WireMock mapping created:', createResponse.data);
    }
  } catch (error) {
    console.error('Error creating/updating WireMock stub:', error.message);
  }
};
