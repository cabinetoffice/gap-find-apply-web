function deleteApplicationById(applicationId, sessionId) {
  cy.request({
    method: 'DELETE',
    url: `http://localhost:8080/application-forms/${applicationId}`,
    headers: { Cookie: `SESSION=${sessionId}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
}

function extractApplicationIdFromURL(url) {
  const applicationId = url
    .split('/build-application/')
    .pop()
    .split('/dashboard')
    .shift();
  return applicationId;
}
function deleteExistingTestApplication() {
  cy.visit('/scheme-list/');
  cy.get(
    '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"]'
  ).click();
  cy.get('[data-cy="cy_schemeDetailsPageHeader"').contains(
    'EV Chargepoint Grant for flat owner-occupiers'
  );

  cy.get('body').then(($body) => {
    if ($body.find(`[data-cy="cy_view-application-link"]`).length) {
      let sessionId;
      cy.get('[data-cy="cy_view-application-link"]').click();
      cy.getCookies().then((cookie) => {
        sessionId = cookie[0].value;
      });
      cy.url()
        .should('include', '/build-application/')
        .and('include', '/dashboard')
        .then((url) => {
          const applicationId = extractApplicationIdFromURL(url);
          deleteApplicationById(applicationId, sessionId);
        });

      cy.visit('/scheme-list/');
      cy.get(
        '[data-cy="cy_linkToScheme_EV Chargepoint Grant for flat owner-occupiers"]'
      ).click();
      cy.get('[data-cy="cy_schemeDetailsPageHeader"').contains(
        'EV Chargepoint Grant for flat owner-occupiers'
      );
      cy.get('[data-cy="cy_view-application-link"]').should('not.exist');
    }
  });
}

export {
  deleteApplicationById,
  deleteExistingTestApplication,
  extractApplicationIdFromURL,
};
