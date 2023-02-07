import { jwtCookie } from '../constants/constants';

export default function resetDatabase() {
  const organisationId = '1';

  const orgDetails = {
    id: organisationId,
    legalName: 'Reset Name',
    type: 'Registered charity',
    addressLine1: 'AND Digital',
    addressLine2: '9 George Square',
    town: 'Glasgow',
    county: 'Lothian',
    postcode: 'G2 1QQ',
    charityCommissionNumber: '12345678',
    companiesHouseNumber: '12345678',
  };

  let formattedCookie = jwtCookie.split('s%3A').pop().split('.');

  formattedCookie.pop();

  let token = formattedCookie.join('.');

  cy.request({
    method: 'PATCH',
    url: 'http://localhost:8080/grant-applicant-organisation-profile/1',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body: orgDetails,
  });
}
