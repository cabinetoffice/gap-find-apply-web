import getLoginCookie from '../../../utils/getLoginCookie';

describe('Header', () => {
  beforeEach(() => {
    getLoginCookie;
    cy.visit({
      url: 'dashboard',
    });
  });

  it('should navigate to the Feedback form when clicked', () => {
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').should('exist');
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').invoke('removeAttr', 'target');
    cy.get('[data-cy=cyBetaFeedbackLinkBanner]').click();
    cy.url().should(
      'eq',
      'https://docs.google.com/forms/d/e/1FAIpQLSeZnNVCqmtnzfZQJSBW_k9CklS2Y_ym2GRt-z0-1wf9pDEgPw/viewform'
    );
  });

  it('should navigate to the Gov.uk homepage when clicked', () => {
    cy.get('[data-cy=cyGovLogoLink]').should('exist');
    cy.get('[data-cy=cyGovLogoLink]').click();
    cy.url().should('eq', 'https://www.gov.uk/');
  });
});
