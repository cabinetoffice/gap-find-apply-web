function unpublishAdvertById(grantAdvertId, sessionId) {
  cy.request({
    method: 'POST',
    url: `http://localhost:8080/grant-advert/${grantAdvertId}/unpublish`,
    headers: { Cookie: `SESSION=${sessionId}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
}

function extractAdvertIdFromUrl(url) {
  const applicationId = url.split('/advert/').pop().split('/summary').shift();
  return applicationId;
}

function unpublishExistingAdvert() {
  //to be at section-overview url by this point
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="cy-unpublish-advert-button"]').length) {
      cy.log('Found advert and unpublishing test advert now');
      let sessionId;
      cy.getCookies().then((cookie) => {
        sessionId = cookie[0].value;
      });
      cy.url()
        .should('include', '/advert/')
        .and('include', '/summary')
        .then((url) => {
          const advertId = extractAdvertIdFromUrl(url);
          unpublishAdvertById(advertId, sessionId);
        });

      cy.reload();
    }
    cy.get('[data-cy="cy-advert-summary-page-back-button"]').click();
    cy.url().should('include', '/section-overview');

    cy.get('[data-cy="cy-unpublish-advert-button"]').should('not.exist');
  });
}

export { extractAdvertIdFromUrl, unpublishExistingAdvert, unpublishAdvertById };
