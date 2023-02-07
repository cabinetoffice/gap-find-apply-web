import getLoginCookie from '../../../utils/getLoginCookie';

describe('Footer', () => {
  beforeEach(() => {
    getLoginCookie;
    cy.visit({
      url: 'dashboard',
    });
  });
  it('should navigate to the Privacy page when the Privacy link on the desktop menu is clicked', () => {
    cy.get('[data-cy="cyPrivacyLinkFooter"]').click();
    cy.url().should('include', '/info/privacy');
  });

  it('should navigate to the Cookies page when the Cookie link on the desktop menu is clicked', () => {
    cy.get('[data-cy="cyCookieLinkFooter"]').click();
    cy.url().should('include', '/info/cookies');
  });

  it('should navigate to the Accessibility page when the Accessibility link on the desktop menu is clicked', () => {
    cy.get('[data-cy="cyAccessibilityLinkFooter"]').click();
    cy.url().should('include', '/info/accessibility');
  });

  it('should navigate to the T&C page when the T&C link on the desktop menu is clicked', () => {
    cy.get('[data-cy="cyTCLinkFooter"]').click();
    cy.url().should('include', '/info/terms-and-conditions');
  });

  it('should navigate to the About Us page when the About Us link on the desktop menu is clicked', () => {
    cy.get('[data-cy="cyAboutUsLinkFooter"]').click();
    cy.url().should('include', '/info/about-us');
  });
});
