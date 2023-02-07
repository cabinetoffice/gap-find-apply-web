import run_accessibility from '../../utils/accessibility';
import resetDatabase from '../../utils/resetDatabase';
import getLoginCookie from '../../utils/getLoginCookie';
import checkErrorBanner from '../../utils/checkErrorBanner';

const organisationUrl = '/organisation';

describe('Manage your organisation details', () => {
  before(() => {
    resetDatabase();
  });

  beforeEach(() => {
    getLoginCookie();
    cy.visit(organisationUrl);
  });

  it('should display correct organisation details', () => {
    resetDatabase();
    run_accessibility();

    // Check URL and labels
    cy.url().should('include', organisationUrl);

    cy.get('[data-cy="cy-manage-organisation-header"]').should(
      'have.text',
      'Your organisation details'
    );
    cy.get('[data-cy=cy-organisation-details-Name]').should(
      'have.text',
      'Name'
    );
    cy.get('[data-cy=cy-organisation-details-Address]').should(
      'have.text',
      'Address'
    );
    cy.get('[data-cy="cy-organisation-details-Type of organisation"]').should(
      'have.text',
      'Type of organisation'
    );
    cy.get(
      '[data-cy="cy-organisation-details-Charity commission number"]'
    ).should('have.text', 'Charity commission number');
    cy.get('[data-cy="cy-organisation-details-Companies house number"]').should(
      'have.text',
      'Companies house number'
    );
  });

  it('should be able to edit organisation name', () => {
    // Check initial name value
    cy.get('[data-cy=cy-organisation-value-Name]').should(
      'have.text',
      'Reset Name'
    );

    // Implement name update
    cy.get('[data-cy=cy-organisation-details-navigation-organisationName]')
      .should('contain', 'Change')
      .click();

    cy.url().should('include', `${organisationUrl}/name`);

    cy.get('[data-cy=cy-legalName-question-title]').should(
      'have.text',
      'Enter the name of your organisation (optional)'
    );

    cy.get('[data-cy=cy-legalName-question-hint]').should(
      'have.text',
      'Enter the official name of your organisation. It could be the name that is registered with Companies House or the Charity Commission.'
    );

    // Check max length validation
    cy.get('[data-cy=cy-legalName-text-input]')
      .should('have.value', 'Reset Name')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    checkErrorBanner('legalName', 'Organisation name must be 250 characters or less', true);

    cy.get('[data-cy=cy-legalName-text-input]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('Organisation Name');
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    // Assert name update has been successful
    cy.url().should('include', organisationUrl);
    cy.get('[data-cy="cy-organisation-value-Name"]').should(
      'have.text',
      'Organisation Name'
    );

    // Check user can cancel actions
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationName]'
    ).click();

    cy.get('[data-cy=cy-legalName-text-input]').clear().type('Cancel Name');
    cy.get('[data-cy=cy-link-Cancel]').click();

    cy.url().should('include', organisationUrl);

    cy.get('[data-cy=cy-organisation-value-Name]').should(
      'have.text',
      'Organisation Name'
    );

    // Check if user can add as well as update name field
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationName]'
    ).click();

    cy.get('[data-cy=cy-legalName-text-input]').clear();
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    cy.get('[data-cy=cy-organisation-value-Name]').should('have.text', '-');
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationName]'
    ).should('contain', 'Add');
  });

  it('should be able to edit organisation type', () => {
    // Check initial type values
    cy.get('[data-cy="cy-organisation-value-Type of organisation"]').should(
      'have.text',
      'Registered charity'
    );

    // Implement type update
    cy.get('[data-cy=cy-organisation-details-navigation-organisationType]')
      .should('contain', 'Change')
      .click();

    cy.url().should('include', `${organisationUrl}/type`);

    cy.get('[data-cy="cy-type-question-title"]').should(
      'have.text',
      'What is your organisation type? (optional)'
    );

    cy.get('[data-cy=cy-details-wrapper]').should('not.have.attr', 'open');
    cy.get('[data-cy=cy-details-title]').click();
    cy.get('[data-cy=cy-details-wrapper]').should('have.attr', 'open');

    run_accessibility();

    cy.get('[data-cy="cy-radioInput-option-RegisteredCharity"]').should('be.checked');

    cy.get('[data-cy="cy-radioInput-option-UnregisteredCharity"]').click();
    cy.get('[data-cy="cy-radioInput-option-UnregisteredCharity"]').should(
      'be.checked'
    );

    cy.get('[data-cy="cy-radioInput-option-LimitedCompany"]').click();
    cy.get('[data-cy="cy-radioInput-option-LimitedCompany"]').should('be.checked');

    cy.get('[data-cy="cy-radioInput-option-NonLimitedCompany"]').click();
    cy.get('[data-cy="cy-radioInput-option-NonLimitedCompany"]').should(
      'be.checked'
    );

    cy.get('[data-cy="cy-radioInput-option-Other"]').click();
    cy.get('[data-cy="cy-radioInput-option-Other"]').should('be.checked');

    cy.get('[data-cy=cy-button-submit-Save]').click();

    // Assert type update has been successful
    cy.url().should('include', organisationUrl);

    cy.get('[data-cy="cy-organisation-value-Type of organisation"]').should(
      'have.text',
      'Other'
    );

    // Check user can cancel actions
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationType]'
    ).click();

    cy.get('[data-cy="cy-radioInput-option-RegisteredCharity"]').click();

    cy.get('[data-cy="cy-link-Cancel"]').click();

    cy.url().should('include', organisationUrl);

    cy.get('[data-cy="cy-organisation-value-Type of organisation"]').should(
      'have.text',
      'Other'
    );
  });

  it('should be able to edit charity commission number', () => {
    // Check initial charity commission number values
    cy.get(
      '[data-cy="cy-organisation-value-Charity commission number"]'
    ).should('have.text', '12345678');

    // Implement charity commission number update
    cy.get('[data-cy=cy-organisation-details-navigation-organisationCharity]')
      .should('contain', 'Change')
      .click();

    cy.url().should('include', `${organisationUrl}/charity-commission-number`);

    cy.get('[data-cy=cy-charityCommissionNumber-question-title]').should(
      'have.text',
      'Enter your Charity Commission number (optional)'
    );

    cy.get('[data-cy=cy-charityCommissionNumber-question-hint]').should(
      'have.text',
      'If your organisation is registered with the Charity Commission, enter your charity number below.Search for your charity number'
    );

    // Check max length validation
    cy.get('[data-cy=cy-charityCommissionNumber-text-input]')
      .should('have.value', '12345678')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    checkErrorBanner('charityCommissionNumber', 'Charity commission number must be 250 characters or less', true);
    
    cy.get('[data-cy=cy-charityCommissionNumber-text-input]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('87654321');
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    // Assert charity commission number update has been successful
    cy.url().should('include', organisationUrl);

    cy.get(
      '[data-cy="cy-organisation-value-Charity commission number"]'
    ).should('have.text', '87654321');

    // Check user can cancel actions
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCharity]'
    ).click();

    cy.get('[data-cy=cy-charityCommissionNumber-text-input]')
      .clear()
      .type('99999999');
    cy.get('[data-cy="cy-link-Cancel"]').click();

    cy.url().should('include', organisationUrl);

    cy.get(
      '[data-cy="cy-organisation-value-Charity commission number"]'
    ).should('have.text', '87654321');

    // Check if user can add as well as update charity commission number field
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCharity]'
    ).click();

    cy.get('[data-cy=cy-charityCommissionNumber-text-input]').clear();
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    cy.get(
      '[data-cy="cy-organisation-value-Charity commission number"]'
    ).should('have.text', '-');
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCharity]'
    ).should('contain', 'Add');
  });

  it('should be able to edit companies house number', () => {
    // Check initial companies house number values
    cy.get('[data-cy="cy-organisation-value-Companies house number"]').should(
      'have.text',
      '12345678'
    );

    // Implement companies house number update
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCompaniesHouseNumber]'
    )
      .should('contain', 'Change')
      .click();

    cy.url().should('include', `${organisationUrl}/companies-house-number`);

    cy.get('[data-cy="cy-companiesHouseNumber-question-title"]').should(
      'have.text',
      'Enter your Companies House number (optional)'
    );

    cy.get('[data-cy="cy-companiesHouseNumber-question-hint"]').should(
      'have.text',
      'If your organisation is registered with Companies House, enter your company number below.Search for your company number'
    );

    // Check max length validation
    cy.get('[data-cy=cy-companiesHouseNumber-text-input]')
    .should('have.value', '12345678')
    .clear()
    .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    checkErrorBanner('companiesHouseNumber', 'Companies house number must be 250 characters or less', true);

    cy.get('[data-cy=cy-companiesHouseNumber-text-input]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('87654321');
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    // Assert companies house number update has been successful
    cy.url().should('include', organisationUrl);

    cy.get('[data-cy="cy-organisation-value-Companies house number"]').should(
      'have.text',
      '87654321'
    );

    // Check user can cancel actions
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCompaniesHouseNumber]'
    ).click();

    cy.get('[data-cy=cy-companiesHouseNumber-text-input]')
      .clear()
      .type('99999999');
    cy.get('[data-cy="cy-link-Cancel"]').click();

    cy.url().should('include', organisationUrl);

    cy.get('[data-cy="cy-organisation-value-Companies house number"]').should(
      'have.text',
      '87654321'
    );

    // Check if user can add as well as update companies house number field
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCompaniesHouseNumber]'
    ).click();

    cy.get('[data-cy=cy-companiesHouseNumber-text-input]').clear();
    cy.get('[data-cy="cy-button-submit-Save"]').click();

    cy.get('[data-cy="cy-organisation-value-Companies house number"]').should(
      'have.text',
      '-'
    );
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationCompaniesHouseNumber]'
    ).should('contain', 'Add');
  });

  it('should be able to edit organisation address', () => {
    // Check initial address values
    cy.get('[data-cy=cy-organisation-value-Address]').should(
      'have.text',
      'AND Digital,9 George Square,Glasgow,Lothian,G2 1QQ'
    );

    // Check if user can update address
    cy.get('[data-cy=cy-organisation-details-navigation-organisationAddress]')
      .should('contain', 'Change')
      .click();

    cy.url().should('include', `${organisationUrl}/address`);

    cy.get('[data-cy=cy-addressInput-question-title]').should(
      'have.text',
      'Enter the address of your organisation (optional)'
    );


    // Check max length validation
    cy.get('[data-cy="cy-addressLine1-text-input"]')
      .should('have.value', 'AND Digital')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-addressLine2-text-input"]')
      .should('have.value', '9 George Square')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-town-text-input"]')
      .should('have.value', 'Glasgow')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-county-text-input"]')
      .should('have.value', 'Lothian')
      .clear()
      .type('a'.repeat(251), { delay: 0 });
    cy.get('[data-cy="cy-postcode-text-input"]')
      .should('have.value', 'G2 1QQ')
      .clear()
      .type('a'.repeat(9), { delay: 0 });

    cy.get('[data-cy="cy-button-submit-Save"]').click();

    checkErrorBanner('addressLine1', 'Address line 1 must be 250 characters or less', true);
    checkErrorBanner('addressLine2', 'Address line 2 must be 250 characters or less', true);
    checkErrorBanner('town', 'Town or City must be 250 characters or less', true);
    checkErrorBanner('county', 'County must be 250 characters or less', true);
    checkErrorBanner('postcode', 'Postcode must be 8 characters or less', true);

    cy.get('[data-cy="cy-addressLine1-text-input"]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('AND Digital Offices');
    cy.get('[data-cy="cy-addressLine2-text-input"]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('9 George Sq');
    cy.get('[data-cy=cy-town-text-input]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('City of Glasgow');
    cy.get('[data-cy=cy-county-text-input]')
      .should('have.value', 'a'.repeat(251))
      .clear()
      .type('West Lothian');
    cy.get('[data-cy=cy-postcode-text-input]')
      .should('have.value', 'a'.repeat(9))
      .clear()
      .type('G02 1QQ');

    cy.get('[data-cy=cy-button-submit-Save]').click();

    // Assert address update has been successful
    cy.url().should('include', organisationUrl);

    cy.get('[data-cy=cy-organisation-value-Address]').should(
      'have.text',
      'AND Digital Offices,9 George Sq,City of Glasgow,West Lothian,G02 1QQ'
    );

    // Check if user can cancel actions
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationAddress]'
    ).click();

    cy.get('[data-cy="cy-addressLine1-text-input"]')
      .clear()
      .type('Cancel Offices');
    cy.get('[data-cy="cy-link-Cancel"]').click();

    cy.url().should('include', organisationUrl);

    cy.get('[data-cy=cy-organisation-value-Address]').should(
      'have.text',
      'AND Digital Offices,9 George Sq,City of Glasgow,West Lothian,G02 1QQ'
    );

    // Check if user can add as well as update address fields
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationAddress]'
    ).click();

    cy.get('[data-cy="cy-addressLine1-text-input"]').clear();
    cy.get('[data-cy="cy-addressLine2-text-input"]').clear();
    cy.get('[data-cy=cy-town-text-input]').clear();
    cy.get('[data-cy=cy-county-text-input]').clear();
    cy.get('[data-cy=cy-postcode-text-input]').clear();

    cy.get('[data-cy=cy-button-submit-Save]').click();

    cy.get('[data-cy="cy-organisation-no-address-data"]').should(
      'have.text',
      '-'
    );
    cy.get(
      '[data-cy=cy-organisation-details-navigation-organisationAddress]'
    ).should('contain', 'Add');
  });

  after(() => {
    resetDatabase();
  });
});
