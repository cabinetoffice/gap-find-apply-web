import { EXCESSIVE_CHARACTER_STRING } from '../../constants/constants';
import checkErrorBanner from '../../utils/checkErrorBanner';
import { deleteExistingGrantAdvert } from '../../utils/deleteTestAdverts';
import run_accessibility from '../../utils/run_accessibility';

describe('Adding an application to a scheme', () => {
  before(() => {
    cy.session('Creating a new advert', () => {
      cy.visit('/');
    });
    cy.visit('/');
  });

  beforeEach(() => {
    deleteExistingGrantAdvert();
    cy.visit('/');
  });
  afterEach(() => {
    deleteExistingGrantAdvert();
  });

  it.skip('Should NOT render "Grant adverts" section if viewMode=dev is not set', () => {
    // Go to scheme list page -> "Woodland Partnership (Forestry England)" scheme dashboard
    cy.get('[data-cy="cy_SchemeListButton"]').click();
    cy.get(
      '[data-cy="cy_linkToScheme_Woodland Partnership (Forestry England)"]'
    )
      .should('exist')
      .click();
    cy.get('[data-cy="cy_schemeDetailsPageHeader"]').contains(
      'Woodland Partnership (Forestry England)'
    );

    run_accessibility();

    cy.url().should('not.include', '?viewMode=dev');
    cy.get('[data-cy="build-advert-component"]').should('not.exist');
  });

  it('Should allow an advert to be attached to the grant', () => {
    cy.visit('/scheme/3');

    cy.get('[data-cy="cy_schemeDetailsPageHeader"]')
      .contains('Woodland Partnership (Forestry England)')
      .and('have.prop', 'tagName', 'H1');

    run_accessibility();

    // Confirming navigation
    cy.get('[data-cy="cyBuildAdvert"]').should('exist').click();
    cy.get('[data-cy="cyBackNewAdvertName"]').click();
    cy.url().should('include', '/scheme/3');
    cy.get('[data-cy="cy-create-an-advert-text"]')
      .should('exist')
      .should('have.text', 'Create and publish an advert for your grant.');
    cy.get('[data-cy="cyBuildAdvert"]').should('exist').click();

    // Asserting that all the key name page elements exist
    cy.get('[data-cy="cyBackNewAdvertName"]').should('exist');
    cy.get('[data-cy="cy-name-question-title"]')
      .should('have.prop', 'tagName', 'H1')
      .and('contain', 'What is the name of your grant?');
    cy.get('[data-cy="cy-name-text-input"]').should('exist');
    cy.get('[data-cy="cy-button-Save and continue"]').should('exist');

    // VC: no name
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    // Check that there is nothing in the box
    cy.get('[data-cy="cy-name-text-input"]').should('have.value', '');

    checkErrorBanner('name', 'Enter the name of your grant');

    // VC: too many characters
    cy.get('[data-cy="cy-name-text-input"]').type(EXCESSIVE_CHARACTER_STRING, {
      delay: 0,
    });
    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.get('[data-cy="cy-name-text-input"]').should(
      'have.value',
      EXCESSIVE_CHARACTER_STRING
    );

    checkErrorBanner(
      'name',
      'Grant name cannot be greater than 255 characters'
    );

    // Happy path
    cy.get('[data-cy="cy-name-text-input"]').clear().type('Advert');
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    // Asserting that an advert has been successfully created and back navigation takes to application form dashboard
    cy.url().should('include', 'section-overview');

    //Returning to scheme details page should render the advert is in progress
    cy.get('[data-cy="cy-back-button"]').contains('Back').click();

    //Scheme details page

    cy.get('[dataCy="cyBuildAdvert"]').should('not.exist');

    cy.get('[data-cy="build-advert-component"]')
      .should('have.prop', 'tagName', 'H2')
      .and('contain', 'Grant advert');

    run_accessibility();
    cy.get('[data-cy="cy-information-published-status-tag-line"]').contains(
      'You have created an advert, but it is not live on Find a grant'
    );
    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"]')
      .contains('View or change your advert')
      .and('have.attr', 'href')
      .and('include', '/section-overview');

    cy.get('[data-cy="cyViewOrChangeYourAdvert-link"').click();

    //in section overview page
    cy.url().should('include', 'section-overview');
  });
});
