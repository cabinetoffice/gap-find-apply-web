const BACKEND_HOST = process.env.BACKEND_HOST;

export async function verifyToken(token: string) {
  const response = await fetch(`${BACKEND_HOST}/jwt/isValid`, {
    method: 'post',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return response.json();
}

export async function decodeTheTokenPayloadInAReadableFormat(token: string) {
  const response = await fetch(`${BACKEND_HOST}/jwt/readablePayload`, {
    method: 'get',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  return response.json();
}

export interface JwtPayload {
  sub: string;
  lastLogin: string;
  features: string;
  iss: string;
  cognitoUsername: string;
  givenName: string;
  aud: string;
  eventId: string;
  tokenUse: string;
  phoneNumber: string;
  authTime: number;
  exp: number;
  iat: number;
  familyName: string;
  email: string;
  isAdmin: string;
}
