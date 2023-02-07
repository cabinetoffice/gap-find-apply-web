import { jwtCookie } from '../constants/constants';

export default function getLoginCookie() {
  cy.setCookie('find-grants-test', jwtCookie);
}
