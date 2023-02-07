export default function deleteTestSchemes(schemeId) {
  cy.visit('/scheme-list');
  cy.get('body').then(($body) => {
    if ($body.find(`[data-cy="cy_linkToScheme_${schemeId}"]`).length) {
      let sessionId;
      cy.get(`[data-cy="cy_linkToScheme_${schemeId}"]`).each(() => {
        cy.get(`[data-cy="cy_linkToScheme_${schemeId}"]`).eq(0).click();
        cy.getCookies().then((cookie) => {
          sessionId = cookie[0].value;
        });
        cy.url({ timeout: 10000 })
          .should('include', '/scheme/')
          .then((url) => {
            let schemeId = url.split('/').at(-1);
            deleteSchemeById(schemeId, sessionId);
          });
        // cy.reload();
        cy.visit('/scheme-list');
      });
      cy.get(`[data-cy="cy_linkToScheme_${schemeId}"]`).should('not.exist');
    } else {
      cy.get('[data-cy="cy_schemeListBackButton"]').click();
    }
  });
}

function deleteSchemeById(schemeId, sessionId) {
  cy.request({
    method: 'DELETE',
    url: `http://localhost:8080/schemes/${schemeId}`,
    headers: { Cookie: `SESSION=${sessionId}` },
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
}
