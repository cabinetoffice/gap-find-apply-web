import { EXCESSIVE_CHARACTER_STRING } from '../../constants/constants';
import createTestScheme from '../../utils/createTestScheme';
import deleteTestSchemes from '../../utils/deleteTestSchemes';
import run_accessibility from '../../utils/run_accessibility';

describe('Adding an application to a scheme', () => {
  before(() => {
    cy.session('Adding an application to a scheme', () => {
      cy.visit('/');
    });
    cy.visit('/');
    deleteTestSchemes('QA Application Test Scheme');
    createTestScheme('QA Application Test Scheme');
  });

  after(() => {
    deleteTestSchemes('QA Application Test Scheme');
  });

  it('should allow an application to be attached to the grant', () => {
    cy.visit('/');

    cy.get('[data-cy="cy_SchemeListButton"]').click();

    cy.get('[data-cy="cy_linkToScheme_QA Application Test Scheme"]')
      .should('exist')
      .click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'QA Application Test Scheme'
    );

    run_accessibility();

    cy.get('[data-cy="cyBuildApplicationForm"]').click();
    cy.get('[data-cy="cyBackBuildApplicationName"]').click();
    cy.wait(1000);
    cy.get('[data-cy="cyBuildApplicationForm"]').click();

    cy.get('[data-cy="cy-applicationName-question-title"]').should(
      'have.text',
      'Give this application a name'
    );

    // VC: no name
    cy.get('[data-cy="cy-button-Continue"]').click();
    // Check that there is nothing in the box
    cy.get('[data-cy="cy-applicationName-text-input"]').should(
      'have.value',
      ''
    );

    // Check Error banners
    cy.get('[data-cy="cyError_applicationName"]').should(
      'have.text',
      'Enter the name of your application'
    );
    cy.get(
      '[data-cy="cy-applicationName-input-validation-error-details"]'
    ).should('have.text', 'Error: Enter the name of your application');
    cy.get('[data-cy="cyError_applicationName"]').click();
    cy.focused().should('have.attr', 'name', 'applicationName');
    run_accessibility();

    // VC: too many characters
    cy.get('[data-cy="cy-applicationName-text-input"]').type(
      EXCESSIVE_CHARACTER_STRING
    );
    cy.get('[data-cy="cy-button-Continue"]').click();
    cy.get('[data-cy="cy-applicationName-text-input"]').should(
      'have.value',
      EXCESSIVE_CHARACTER_STRING
    );

    // Check Error banners
    cy.get('[data-cy="cyError_applicationName"]').should(
      'have.text',
      'Application name cannot be greater than 255 characters'
    );
    cy.get(
      '[data-cy="cy-applicationName-input-validation-error-details"]'
    ).should(
      'have.text',
      'Error: Application name cannot be greater than 255 characters'
    );
    cy.get('[data-cy="cyError_applicationName"]').click();
    cy.focused().should('have.attr', 'name', 'applicationName');
    run_accessibility();

    cy.get('[data-cy="cy-applicationName-text-input"]')
      .clear()
      .type('Application');
    cy.get('[data-cy="cy-button-Continue"]').click();

    // Asserting that an application has been successfully made and is accessible through a link
    cy.get('[data-cy="cyBuildApplicationBackButton"]').click();
    cy.get('[data-cy="cyBuildApplicationBackButton"]').should('not.exist');
    cy.get('[data-cy="cy-table-caption-Grant application form"]').should(
      'have.text',
      'Grant application form'
    );

    // Clicking the link and asserting that it redirects to the correct application associated with the scheme
    cy.get('[data-cy="cy_view-application-link"]').click();
    cy.get('[data-cy="cyApplicationTitle"]').should('have.text', 'Application');
  });
});
