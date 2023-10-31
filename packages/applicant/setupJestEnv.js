process.env.HOST = 'http://localhost:3000/apply/applicant';
process.env.V2_LOGIN_URL =
  'http://localhost:8082/v2/login?redirectUrl=http://localhost:3000/apply/applicant/isAdmin';
process.env.V2_LOGOUT_URL = 'http://localhost:8082/v2/logout';
process.env.JWT_COOKIE_NAME = 'user-service-token';
