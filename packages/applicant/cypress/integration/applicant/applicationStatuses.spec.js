import run_accessibility from '../../utils/accessibility';
import getLoginCookie from '../../utils/getLoginCookie';
import { submissionIdForStatuses } from '../../constants/constants';

describe('Application section status test', () => {
  beforeEach(() => {
    getLoginCookie();
    cy.visit(`/submissions/${submissionIdForStatuses}/sections`);
  });

  it('should land on Your Application page', () => {
    run_accessibility();

    cy.get('[data-cy="cy-application-name-Test Grant Application 5"]').should(
      'have.text',
      'Test Grant Application 5'
    );
    cy.get('[data-cy="cy-application-header"]').should(
      'have.text',
      'Your Application'
    );
    cy.get('[data-cy=cy-application-help-text]').should(
      'have.text',
      'How the application form works'
    );
    cy.get('[data-cy="cy-application-help-text-bullet-1"]').should(
      'have.text',
      'you must complete each section of the application form'
    );
    cy.get('[data-cy="cy-application-help-text-bullet-2"]').should(
      'have.text',
      'once all sections are complete you can submit your application'
    );
    cy.get('[data-cy="cy-application-help-text-bullet-3"]').should(
      'have.text',
      'you can save your application and come back to it later'
    );

    // Check initial statuses
    cy.get('[data-cy=cy-section-title-link-Eligibility]')
      .should('have.text', 'Eligibility')
      .and('have.attr', 'href');
    cy.get('[data-cy="cy-status-tag-Eligibility-Not Started"]').should(
      'have.text',
      'Not Started'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]')
      .should('have.text', 'Essential Information')
      .and('not.have.attr', 'href');
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-Cannot Start Yet"]'
    ).should('have.text', 'Cannot Start Yet');

    cy.get('[data-cy="cy-section-title-link-Project Information"]')
      .should('have.text', 'Project Information')
      .and('not.have.attr', 'href');
    cy.get(
      '[data-cy="cy-status-tag-Project Information-Cannot Start Yet"]'
    ).should('have.text', 'Cannot Start Yet');
  });

  it('should be able to edit section statuses', () => {
    cy.get('[data-cy="cy-section-title-link-Eligibility"]').click();

    run_accessibility();

    cy.url().should('include', 'questions').and('include', 'ELIGIBILITY');

    cy.get('[data-cy="cy-ELIGIBILITY-question-title-page"]').should(
      'have.text',
      'Eligibility Statement'
    );
    cy.get('[data-cy="cy-radioInput-option-Yes"]').click();

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    run_accessibility();

    cy.url().should('include', 'sections').and('include', 'ELIGIBILITY');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.url().should('include', 'sections').and('not.include', 'ELIGIBILITY');

    // Check statuses after Eligibility toggled to Yes
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-Not Started"]'
    ).should('have.text', 'Not Started');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Not Started"]').should(
      'have.text',
      'Not Started'
    );

    // Edit Essential Information section
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').click();

    run_accessibility();

    cy.url().should('include', 'questions').and('include', 'ESSENTIAL');

    cy.get('[data-cy=cy-APPLICANT_TYPE-select]').select('Other');

    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url().should('include', 'sections').and('not.include', 'ESSENTIAL');

    // Check statuses after Essential Information section has been started
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-In Progress"]'
    ).should('have.text', 'In Progress');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Not Started"]').should(
      'have.text',
      'Not Started'
    );

    // Change Eligibility to No
    cy.get('[data-cy="cy-section-title-link-Eligibility"]').click();

    cy.get('[data-cy="cy-radioInput-option-No"]').click();

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.url().should('include', 'sections').and('include', 'ELIGIBILITY');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.url().should('include', 'sections').and('not.include', 'ELIGIBILITY');

    // Check statuses after Eligibility toggled to No
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'not.have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-In Progress"]'
    ).should('have.text', 'In Progress');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'not.have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Project Information-Cannot Start Yet"]'
    ).should('have.text', 'Cannot Start Yet');

    // Change Eligibility to Yes
    cy.get('[data-cy="cy-section-title-link-Eligibility"]').click();

    cy.get('[data-cy="cy-radioInput-option-Yes"]').click();

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    // Check statuses after Eligibility toggled to Yes
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-In Progress"]'
    ).should('have.text', 'In Progress');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Not Started"]').should(
      'have.text',
      'Not Started'
    );

    // Complete Project Information section
    cy.get('[data-cy="cy-section-title-link-Project Information"]').click();

    run_accessibility();

    cy.url()
      .should('include', 'questions')
      .and('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_TYPE');

    cy.get('[data-cy=cy-CUSTOM_APPLICANT_TYPE-select]').select(
      'Limited company'
    );

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.url()
      .should('include', 'questions')
      .and('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_CUSTOM_QUESTION_1');

    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]')
      .clear()
      .type(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sit amet suscipit est, in egestas urna. Curabitur dictum non nisl.'
      );
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.url()
      .should('include', 'sections')
      .and('include', 'CUSTOM_SECTION_1')
      .and('not.include', 'questions');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.url()
      .should('include', 'sections')
      .and('not.include', 'CUSTOM_SECTION_1');

    // Check statuses after Project Information section has been completed
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-In Progress"]'
    ).should('have.text', 'In Progress');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Completed"]').should(
      'have.text',
      'Completed'
    );

    // Change Eligibility to No
    cy.get('[data-cy="cy-section-title-link-Eligibility"]').click();

    cy.get('[data-cy="cy-radioInput-option-No"]').click();

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    // Check statuses after Eligibility toggled to No
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'not.have.attr',
      'href'
    );
    cy.get(
      '[data-cy="cy-status-tag-Essential Information-In Progress"]'
    ).should('have.text', 'In Progress');

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'not.have.attr',
      'href'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Completed"]').should(
      'have.text',
      'Completed'
    );
  });
});
