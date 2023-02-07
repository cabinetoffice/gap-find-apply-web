const deleteTestAdvert = () => {
  let sessionId;

  cy.getCookies().then((cookie) => {
    sessionId = cookie[0].value;
  });

  cy.url()
    .should('include', '/section-overview')
    .then((url) => {
      let advertId = url.split('/').at(-2);
      deleteAdvertById(advertId, sessionId);
    });
};

const deleteAdvertById = (advertId, sessionId) => {
  cy.request({
    method: 'DELETE',
    url: `http://localhost:8080/grant-advert/${advertId}`,
    headers: { Cookie: `SESSION=${sessionId}` },
  }).then((response) => {
    expect(response.status).to.eq(204);
  });
};

const deleteExistingGrantAdvert = () => {
  cy.visit('/');
  cy.visit('/scheme/3');
  cy.get('body').then(($body) => {
    if ($body.find(`[data-cy="cyViewOrChangeYourAdvert-link"]`).length) {
      cy.get('[data-cy="cyViewOrChangeYourAdvert-link').click();
      deleteTestAdvert();
    }
  });
};
export { deleteTestAdvert, deleteExistingGrantAdvert };
