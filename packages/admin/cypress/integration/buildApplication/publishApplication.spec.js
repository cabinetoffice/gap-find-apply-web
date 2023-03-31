import addQuestionToSection from '../../utils/addQuestionToSection';
import createTestApplication from '../../utils/createTestApplication';
import {
  deleteExistingTestApplication,
  extractApplicationIdFromURL,
} from '../../utils/deleteApplications';
import formatDate from '../../utils/formatDate';
import questionTypePreviewCommonChecks from '../../utils/questionTypePreviewCommonChecks';
import run_accessibility from '../../utils/run_accessibility';

describe('Publish application', () => {
  const applicationName = 'A testing application';
  const sectionName = 'Custom section';
  let applicationId;
  let questionNo = 1;
  let currentUrl;

  before(() => {
    cy.session('Publish applciation', () => {
      cy.visit('/');
    });
    cy.visit('/');

    deleteExistingTestApplication();
    createTestApplication(applicationName);
    cy.get('[data-cy="cy-button-addNewSection"]')
      .should('be.visible')
      .click({ force: true });
    cy.url().should('include', 'section-name');
    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('[data-cy="cy-sectionTitle-text-input"]').type(sectionName);

    cy.get('[data-cy="cy-button-Save and continue"]').click();
    cy.url().then((url) => {
      applicationId = extractApplicationIdFromURL(url);
    });
  });

  after(() => {
    deleteExistingTestApplication();
  });

  it('Should allow an admin to publish and unpublish an application', () => {
    // Dashboard page
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    //check button is disabled
    cy.get('[data-cy="cy_publishApplication-button"]').should(
      'have.attr',
      'disabled'
    );

    //fill up eligibility statement
    cy.get('[data-cy="cy-table-caption-1. Eligibility"]').should(
      'contain',
      '1. Eligibility'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-0"]').should(
      'contain',
      'Eligibility Statement'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-1"]').should(
      'have.text',
      'INCOMPLETE'
    );

    //Eligibility statement
    cy.get('[data-cy="cy_Section-Eligibility Statement"]').click();

    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('h1').contains('Eligibility statement');

    cy.get('textarea').should('have.value', '');

    cy.get('textarea').click().clear().type('dummy eligibility statement');
    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-1. Eligibility"]').should(
      'contain',
      '1. Eligibility'
    );

    cy.get('[data-cy="cy_table_row-for-1. Eligibility-row-0-cell-1"]').should(
      'have.text',
      'COMPLETE'
    );

    cy.get('[data-cy="cy_publishApplication-button"]').should(
      'have.attr',
      'disabled'
    );
    //ticking due diligence checks
    cy.get('[data-cy="cy-table-caption-2. Required checks"]').should(
      'contain',
      '2. Required checks'
    );

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-0"]'
    ).should('contain', 'Due-diligence checks');

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-1"]'
    ).should('have.text', 'INCOMPLETE');

    //navigating to due diligence page
    cy.get('[data-cy="cy_Section-due-diligence-checks"]').click();

    cy.url().should('include', 'due-diligence');

    cy.get(`[data-cy="cy-question-page-caption-${applicationName}"]`).contains(
      applicationName
    );
    cy.get('h1').contains('Due-diligence checks');

    //Checking tick box
    cy.get('[type="checkbox"]').should('not.be.checked');
    cy.get('[type="checkbox"]').check();
    cy.get('[type="checkbox"]').should('be.checked');

    cy.get('[data-cy="cy-button-Save and exit"]')
      .contains('Save and exit')
      .click();

    cy.url().should('include', 'dashboard');
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');

    cy.get('[data-cy="cy-table-caption-2. Required checks"]').should(
      'contain',
      '2. Required checks'
    );

    cy.get(
      '[data-cy="cy_table_row-for-2. Required checks-row-0-cell-1"]'
    ).should('have.text', 'COMPLETE');

    //Add a question

    addQuestionToSection(sectionName, questionNo);

    cy.get('input[data-cy="cy-radioInput-option-ShortAnswer"]').check();
    cy.get('[data-cy="cy-button-Save and continue"]').click();

    cy.url().should('contain', `build-application/${applicationId}/dashboard`);

    //check edit application form buttons exists
    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).should('exist');

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"]`).should(
      'exist'
    );

    cy.get(`[data-cy="cy_sections_deleteSectionBtn-${sectionName}"]`)
      .contains('Delete this section')
      .and('exist');

    cy.get('[data-cy="cy-button-addNewSection"]')
      .contains('Add new section')
      .and('exist');

    cy.get(`[data-cy="cy_addAQuestion-${sectionName}"]`)
      .contains('Add a question')
      .and('exist');

    //button should not be disabled
    cy.get('[data-cy="cy_publishApplication-button"]')
      .should('not.be.disabled')
      .click();

    //confirmation page

    cy.get('[data-cy="cy-confirmation-question-title"]').contains(
      'Are you sure you want to publish your application form?'
    );

    run_accessibility();

    cy.url()
      .should('include', 'build-application')
      .and('include', 'publish-confirmation');

    //confirming no

    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    cy.get('[data-cy="cy-radioInput-option-No"]').check();
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');

    cy.get('[data-cy="cy_publishConfirmation-ConfirmButton"]')
      .contains('Confirm')
      .click();

    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');
    cy.url().should('include', 'build-application').and('include', 'dashboard');
    cy.get('[data-cy="cy_publishedDashboard-publishStatus"]').should(
      'not.exist'
    );
    //confirming publish

    cy.get('[data-cy="cy_publishApplication-button"]')
      .should('not.be.disabled')
      .click();
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    cy.get('[data-cy="cy_publishConfirmation-ConfirmButton"]')
      .contains('Confirm')
      .click();

    //publish success page
    cy.get('h1').contains('Grant application form published');
    run_accessibility();

    cy.url()
      .should('include', 'build-application')
      .and('include', 'publish-success');

    cy.get('[data-cy="cy_publishSuccess-AddANewGrant-link"]').contains(
      'Add a new grant'
    );

    cy.get('[data-cy="cy_publishSuccess-manageThisGrant-button"]')
      .contains('Manage this grant')
      .click();

    //Scheme page
    cy.url().should('include', `apply/admin/scheme`);
    cy.get(
      '[data-cy="cy_table_row-for-Grant application form-row-0-cell-2"]'
    ).then((element) => {
      const todaysDate = formatDate(new Date()).toString();

      cy.get(element).contains(todaysDate);
    });
    //check export buttons are not clickable
    run_accessibility();
    cy.get('[data-cy="cy_Scheme-details-page-h2-View submitted applciations"]')
      .contains('View submitted applications')
      .should('have.prop', 'tagName')
      .and('eq', 'H2');

    cy.get('[data-cy="cy_Scheme-details-page-Submission-count-text"]').contains(
      'No applications have been submitted.'
    );

    cy.get(
      '[data-cy="cy_Scheme-details-page-button-View submitted application"]'
    )
      .contains('View submitted applications')
      .should('have.attr', 'disabled');
    cy.get(
      '[data-cy="cy_Scheme-details-page-button-View submitted application"]'
    ).should('not.have.attr', 'href');

    //required checks section
    cy.get('[data-cy="cy_Scheme-details-page-h2-Required checks"]')
      .contains('Required checks')
      .should('have.prop', 'tagName')
      .and('eq', 'H2');

    cy.get(
      '[data-cy="cy_Scheme-details-page-Required-checks-text-1"]'
    ).contains(
      "Download the information from the 'Required checks' section of the application form only."
    );

    cy.get(
      '[data-cy="cy_Scheme-details-page-Required-checks-text-2"]'
    ).contains(
      'You can use this information to carry out due-diligence checks. You can use the Cabinet Office service Spotlight for these checks.'
    );

    cy.get('[data-cy="cy_Scheme-details-page-button-Download required checks"]')
      .contains('Download required checks')
      .should('have.attr', 'disabled');

    cy.get(
      '[data-cy="cy_Scheme-details-page-button-Download required checks"]'
    ).should('not.have.attr', 'href');

    cy.get('[data-cy="cy_view-application-link"]').click();
    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');
    cy.url().should('include', 'dashboard');

    run_accessibility();
    cy.get('[data-cy="cy_publishedDashboard-publishStatus"]').contains(
      'Published'
    );

    //check some buttons are not viewable anymore

    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).should('not.exist');

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"]`).should(
      'exist'
    );

    cy.get(`[data-cy="cy_sections_deleteSectionBtn-${sectionName}"]`).should(
      'not.exist'
    );

    cy.get('[data-cy="cy-button-addNewSection"]').should('not.exist');

    cy.get(`[data-cy="cy_addAQuestion-${sectionName}"]`).should('not.exist');

    cy.get('[data-cy="cy_publishApplication-button"]').should('not.exist');

    //Question preview should not contain change buttons
    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"`)
      .contains('View')
      .click();

    cy.url().should('include', 'preview');
    run_accessibility();

    questionTypePreviewCommonChecks(questionNo, false);
    //visiting an edit page should redirect to preview page

    cy.url().then((url) => {
      currentUrl = url.split('/preview')[0];
      cy.visit(`${currentUrl}/edit/question-content`);

      //back to preview page
      cy.url().should('include', `${currentUrl}/preview`);

      cy.visit(`${currentUrl}/edit/question-options`);
      cy.url().should('include', `${currentUrl}/preview`);
    });

    //return to dashboard
    cy.get(
      '[data-cy="cy_questionPreview-returnToApplicationFormButton-published"]'
    )
      .contains('Return to application form')
      .click();
    //unpublish should render

    cy.get('[data-cy="cy_unpublishApplication-button"]')
      .contains('Unpublish')
      .click();

    cy.url()
      .should('includes', 'build-application')
      .and('includes', 'unpublish-confirmation');

    run_accessibility();

    cy.get('h1').contains(
      'Are you sure you want to unpublish this application form?'
    );

    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');

    cy.get('[data-cy="cy-radioInput-option-No"]').check();
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');

    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]')
      .contains('Confirm')
      .click();

    //back to dashboard
    cy.get('[data-cy="cyApplicationTitle"]').should(
      'have.text',
      applicationName
    );
    cy.get('h1').should('have.text', 'Build an application form');
    cy.url().should('include', 'build-application').and('include', 'dashboard');
    cy.get('[data-cy="cy_publishedDashboard-publishStatus"]').contains(
      'Published'
    );
    cy.get('[data-cy="cy_unpublishApplication-button"]').click();

    //selecting yes on unconfirm page
    cy.get('[data-cy="cy-radioInput-option-No"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('not.be.checked');
    cy.get('[data-cy="cy-radioInput-option-Yes"]').check();

    cy.get('[data-cy="cy_unpublishConfirmation-ConfirmButton"]').click();

    //back to dashboard with banner

    cy.get('[data-cy="cy_unpublishedApplication-banner"]').contains(
      'Grant application form unpublished'
    );
    cy.url()
      .should('includes', 'build-application')
      .and('includes', 'dashboard');

    //checking banner disappears on reload
    cy.get('[data-cy="cyBuildApplicationBackButton"]').click();

    cy.get('[data-cy="cy_view-application-link"]').contains('View').click();

    //check banner and tag is no longer there
    cy.get('[data-cy="cy_unpublishedApplication-banner"]').should('not.exist');
    cy.get('[data-cy="cy_publishedDashboard-publishStatus"]').should(
      'not.exist'
    );

    //check delete/add buttons are back
    cy.get(
      `[data-cy="cy_deleteQuestion-Section-${sectionName}-QA Question ${questionNo} Title"]`
    ).should('exist');

    cy.get(`[data-cy="cy_Section-QA Question ${questionNo} Title"]`).should(
      'exist'
    );

    cy.get(`[data-cy="cy_sections_deleteSectionBtn-${sectionName}"]`).should(
      'exist'
    );

    cy.get('[data-cy="cy-button-addNewSection"]').should('exist');

    cy.get(`[data-cy="cy_addAQuestion-${sectionName}"]`).should('exist');

    cy.get('[data-cy="cy_publishApplication-button"]').should('exist');

    //check published date is removed
    cy.get('[data-cy="cyBuildApplicationBackButton"]').click();

    cy.url().should('include', `apply/admin/scheme`);
    cy.get(
      '[data-cy="cy_table_row-for-Grant application form-row-0-cell-2"]'
    ).contains('-');
  });
});
