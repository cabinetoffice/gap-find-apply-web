import { submissionId } from '../../constants/constants';
import run_accessibility from '../../utils/accessibility';
import checkErrorBanner from '../../utils/checkErrorBanner';
import checkQuestionTitlesAndURL from '../../utils/checkQuestionHeadersAndURL';
import checkSectionSummary from '../../utils/checkSectionSummary';
import getLoginCookie from '../../utils/getLoginCookie';

// sections-test-data.sql is required for this test
describe('View your applications', () => {
  beforeEach(() => {
    getLoginCookie();
    cy.visit('applications');
  });

  it('should display correct applications list', () => {
    run_accessibility();

    // Check URL and labels
    cy.url().should('include', 'applications');

    cy.get('[data-cy=cy-your-applications-header]').should(
      'have.text',
      'Your applications'
    );
    cy.get('[data-cy=cy-your-applications-description]').should(
      'have.text',
      'All of your current and past applications are listed below.'
    );
    cy.get('[data-cy=cy-grant-table-header]').should(
      'have.text',
      'Name of grant'
    );
    cy.get('[data-cy="cy-application-link-Test Grant Application 2"]').should(
      'have.text',
      'Test Grant Application 2'
    );
  });

  it('should be able to view an application', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application 2"]').click();

    run_accessibility();

    // Check URL and labels
    cy.url().should('include', 'submissions').and('include', 'sections');

    cy.get('[data-cy="cy-application-name-Test Grant Application 2"]').should(
      'have.text',
      'Test Grant Application 2'
    );
    cy.get('[data-cy=cy-application-header]').should(
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
    cy.get('[data-cy=cy-section-title-link-Eligibility]').should(
      'have.text',
      'Eligibility'
    );
    cy.get('[data-cy="cy-status-tag-Eligibility-Not Started"]').should(
      'have.text',
      'Not Started'
    );
    cy.get('[data-cy="cy-section-title-link-Essential Information"]').should(
      'have.text',
      'Essential Information'
    );
    cy.get('[data-cy="cy-status-tag-Essential Information-Completed"]').should(
      'have.text',
      'Completed'
    );

    cy.get('[data-cy="cy-section-title-link-Project Information"]').should(
      'have.text',
      'Project Information'
    );
    cy.get('[data-cy="cy-status-tag-Project Information-Not Started"]').should(
      'have.text',
      'Not Started'
    );
  });

  it('should be able to edit eligibility statement', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application 2"]').click();

    cy.get('[data-cy=cy-section-title-link-Eligibility]').click();

    // Check Titles and URL for Eligibility Statement
    checkQuestionTitlesAndURL(
      'ELIGIBILITY',
      'ELIGIBILITY',
      'Eligibility Statement',
      'Some admin supplied text describing what it means to be eligible to apply for this grant'
    );

    cy.get('[data-cy="cy-eligibility-question-paragraph-1"]').should(
      'have.text',
      'The criteria below tells you if your organisation is eligible to apply.'
    );
    cy.get('[data-cy="cy-eligibility-question-paragraph-2"]').should(
      'have.text',
      'Making sure your organisation is eligible before you apply saves you time.'
    );
    cy.get('[data-cy="cy-eligibility-question-paragraph-3"]').should(
      'have.text',
      'It also means time and money are not spent processing applications from organisations that are not eligible.'
    );
    cy.get(
      '[data-cy="cy-eligibility-question-heading-Test Grant Application 2"]'
    ).should('have.text', 'Eligibility criteria for Test Grant Application 2');

    // Check user cannot save and continue or save and exit without entering input
    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner('ELIGIBILITY', 'Select an option', false);

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.get('[data-cy="cy-status-tag-Eligibility-Not Started"]').should(
      'have.text',
      'Not Started'
    );

    cy.get('[data-cy=cy-section-title-link-Eligibility]').click();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');

    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner('ELIGIBILITY', 'Select an option', false);

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner('ELIGIBILITY', 'Select an option', false);

    // Check user can edit Eligibility Statement
    cy.get('[data-cy="cy-radioInput-option-No"]').click();
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions')
      .and('not.include', 'ELIGIBILITY');

    cy.get('[data-cy=cy-section-title-link-Eligibility]').click();

    // Input yes or no
    cy.get('[data-cy="cy-radioInput-option-No"]').should('be.checked');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check summary of Eligibility Statement
    cy.get('[data-cy="cy-manage-section-header"]').should(
      'have.text',
      'Summary of Eligibility'
    );
    run_accessibility();

    checkSectionSummary('ELIGIBILITY', 'Eligibility Statement', 'No');

    cy.get('[data-cy="cy-isComplete-question-title"]').should(
      'have.text',
      'Have you completed this section?'
    );
    cy.get('[data-cy="cy-radioInput-label-YesIveCompletedThisSection"]').should(
      'have.text',
      `Yes, I've completed this section`
    );
    cy.get('[data-cy="cy-radioInput-label-NoIllComeBackLater"]').should(
      'have.text',
      `No, I'll come back later`
    );
    cy.get('[data-cy="cy-submit-application-button"]').click();

    checkErrorBanner(
      'isComplete',
      `Select 'Yes, I've completed this section' or 'No, I'll come back later'`,
      true
    );

    cy.get('[data-cy="cy-radioInput-option-NoIllComeBackLater"]').click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions')
      .and('not.include', 'ELIGIBILITY');

    cy.get('[data-cy="cy-status-tag-Eligibility-In Progress"]').should(
      'have.text',
      'In Progress'
    );

    cy.get('[data-cy=cy-section-title-link-Eligibility]').click();
    cy.get('[data-cy="cy-radioInput-option-Yes"]').click();
    cy.get('[data-cy="cy-button-save-and-exit"]').click();
    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions')
      .and('not.include', 'ELIGIBILITY');

    cy.get('[data-cy=cy-section-title-link-Eligibility]').click();
    cy.get('[data-cy="cy-radioInput-option-Yes"]').should('be.checked');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkSectionSummary('ELIGIBILITY', 'Eligibility Statement', 'Yes');

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions')
      .and('not.include', 'ELIGIBILITY');

    cy.get('[data-cy="cy-status-tag-Eligibility-Completed"]').should(
      'have.text',
      'Completed'
    );
  });

  it('should be able to edit project information', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application 2"]').click();

    cy.get('[data-cy="cy-section-title-link-Project Information"]').click();

    // Check Titles and URL for Organisation Type
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_APPLICANT_TYPE',
      'Choose your organisation type',
      'Choose the option that best describes your organisation'
    );

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_TYPE-select]').should(
      'have.value',
      ''
    );

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_TYPE',
      'Select at least one option',
      true
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_TYPE`
    );

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_TYPE',
      'Select at least one option',
      true
    );

    // Check and Edit Organisation Type
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_TYPE-select]').select('Other');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.get('[data-cy="cy-status-tag-Project Information-In Progress"]').should(
      'have.text',
      'In Progress'
    );

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_TYPE`
    );

    cy.get('[data-cy=cy-CUSTOM_APPLICANT_TYPE-select]')
      .should('have.value', 'Other')
      .select('Limited company');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Custom Question 1
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_CUSTOM_QUESTION_1',
      'Description of the project, please include information regarding public accessibility (see GOV.UK guidance for a definition of public access) to the newly planted trees'
    );

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_CUSTOM_QUESTION_1',
      'You must enter an answer',
      true
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_TYPE');

    cy.get('[data-cy=cy-CUSTOM_APPLICANT_TYPE-select]').should(
      'have.value',
      'Limited company'
    );

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_CUSTOM_QUESTION_1`
    );
    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner(
      'CUSTOM_CUSTOM_QUESTION_1',
      'You must enter an answer',
      true
    );

    // Check and Edit Custom Question 1
    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]')
      .clear()
      .type(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sit amet suscipit est, in egestas urna. Curabitur dictum non nisl.'
      );
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_CUSTOM_QUESTION_1`
    );

    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]')
      .should(
        'have.value',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sit amet suscipit est, in egestas urna. Curabitur dictum non nisl.'
      )
      .clear()
      .type(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur a mauris congue, feugiat sem ac, condimentum risus. Praesent at enim.'
      );

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Organisation Name
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_APPLICANT_ORG_NAME',
      'Enter the name of your organisation'
    );

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_NAME-text-input]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_NAME',
      'You must enter an answer',
      true
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_CUSTOM_QUESTION_1');

    cy.get('[data-cy=cy-CUSTOM_CUSTOM_QUESTION_1-text-area]').should(
      'have.value',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur a mauris congue, feugiat sem ac, condimentum risus. Praesent at enim.'
    );

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_NAME`
    );
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_NAME-text-input]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_NAME',
      'You must enter an answer',
      true
    );

    // Check and Edit Organisation Name
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_NAME-text-input]')
      .clear()
      .type('Organisation Name');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_NAME`
    );

    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_NAME-text-input]')
      .should('have.value', 'Organisation Name')
      .clear()
      .type('Name of Organisation');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Organisation Address
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_APPLICANT_ORG_ADDRESS',
      `Enter your organisation's address`
    );
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-question-title]'
    ).should('have.text', 'Address line 1');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-question-title]'
    ).should('have.text', 'Address line 2 (optional)');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-question-title]'
    ).should('have.text', 'Town or City');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-question-title]'
    ).should('have.text', 'County (optional)');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-question-title]'
    ).should('have.text', 'Postcode');

    // Check user cannot save and continue or save and exit without input
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-text-input]'
    ).clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-text-input]'
    ).clear();
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-text-input]').clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-text-input]'
    ).clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-text-input]'
    ).clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1',
      'You must enter an answer for address line 1',
      true
    );

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-town',
      'You must enter an answer for town or city',
      true
    );

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-postcode',
      'You must enter an answer for postcode',
      true
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_ORG_NAME');

    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_NAME-text-input]').should(
      'have.value',
      'Name of Organisation'
    );

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_ADDRESS`
    );
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-text-input]'
    ).clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-text-input]'
    ).clear();
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-text-input]').clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-text-input]'
    ).clear();
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-text-input]'
    ).clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1',
      'You must enter an answer for address line 1',
      true
    );

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-town',
      'You must enter an answer for town or city',
      true
    );

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_ADDRESS-postcode',
      'You must enter an answer for postcode',
      true
    );

    // Check and Edit Organisation Address
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-text-input]'
    )
      .clear()
      .type('Address Line 1');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-text-input]'
    )
      .clear()
      .type('Address Line 2');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-text-input]')
      .clear()
      .type('Town or City');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-text-input]')
      .clear()
      .type('County');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-text-input]')
      .clear()
      .type('Postcode');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_ADDRESS`
    );

    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-text-input]'
    )
      .should('have.value', 'Address Line 1')
      .clear()
      .type('Line 1');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-text-input]'
    )
      .should('have.value', 'Address Line 2')
      .clear()
      .type('Line 2');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-text-input]')
      .should('have.value', 'Town or City')
      .clear()
      .type('Town');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-text-input]')
      .should('have.value', 'County')
      .clear()
      .type('County input');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-text-input]')
      .should('have.value', 'Postcode')
      .clear()
      .type('POSTCODE');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Companies House Number
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE',
      'Does your organisation have a Companies House number?',
      'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.'
    );

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy=cy-radioInput-option-Yes]').should('not.be.checked');
    cy.get('[data-cy=cy-radioInput-option-No]').should('not.be.checked');

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE',
      'Select an option',
      false
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_ORG_ADDRESS');

    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-1-text-input]'
    ).should('have.value', 'Line 1');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-address-line-2-text-input]'
    ).should('have.value', 'Line 2');
    cy.get('[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-town-text-input]').should(
      'have.value',
      'Town'
    );
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-county-text-input]'
    ).should('have.value', 'County input');
    cy.get(
      '[data-cy=cy-CUSTOM_APPLICANT_ORG_ADDRESS-postcode-text-input]'
    ).should('have.value', 'POSTCODE');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE`
    );
    cy.get('[data-cy=cy-radioInput-option-Yes]').should('not.be.checked');
    cy.get('[data-cy=cy-radioInput-option-No]').should('not.be.checked');

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE',
      'Select an option',
      false
    );

    // Check and Edit Companies House Number
    cy.get('[data-cy=cy-radioInput-option-Yes]').click().should('be.checked');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE`
    );

    cy.get('[data-cy=cy-radioInput-option-Yes]').should('be.checked');
    cy.get('[data-cy=cy-radioInput-option-No]').click().should('be.checked');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Charity Number
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_APPLICANT_ORG_CHARITY_NUMBER',
      'What type is your company',
      'Funding organisation might use this to identify your organisation when you apply for a grant. It might also be used to check your organisation is legitimate.'
    );
    cy.get('[data-cy="cy-checkbox-label-Limited company"]').should(
      'have.text',
      'Limited company'
    );
    cy.get('[data-cy="cy-checkbox-label-Non-limited company"]').should(
      'have.text',
      'Non-limited company'
    );
    cy.get('[data-cy="cy-checkbox-label-Registered charity"]').should(
      'have.text',
      'Registered charity'
    );
    cy.get('[data-cy="cy-checkbox-label-Other"]').should('have.text', 'Other');

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy="cy-checkbox-value-Limited company"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Non-limited company"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Registered charity"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Other"]').should('not.be.checked');

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_CHARITY_NUMBER',
      'Select an option',
      false
    );

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_ORG_COMPANIES_HOUSE');

    cy.get('[data-cy=cy-radioInput-option-No]').should('be.checked');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_CHARITY_NUMBER`
    );
    cy.get('[data-cy="cy-checkbox-value-Limited company"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Non-limited company"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Registered charity"]').should(
      'not.be.checked'
    );
    cy.get('[data-cy="cy-checkbox-value-Other"]').should('not.be.checked');

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    checkErrorBanner(
      'CUSTOM_APPLICANT_ORG_CHARITY_NUMBER',
      'Select an option',
      false
    );

    // Check and Edit Charity Number
    cy.get('[data-cy="cy-checkbox-value-Limited company"]').click();
    cy.get('[data-cy="cy-checkbox-value-Other"]').click();

    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_APPLICANT_ORG_CHARITY_NUMBER`
    );

    cy.get('[data-cy="cy-checkbox-value-Limited company"]')
      .should('be.checked')
      .click();
    cy.get('[data-cy="cy-checkbox-value-Other"]').should('be.checked').click();

    cy.get('[data-cy="cy-checkbox-value-Non-limited company"]')
      .should('not.be.checked')
      .click();
    cy.get('[data-cy="cy-checkbox-value-Registered charity"]')
      .should('not.be.checked')
      .click();

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check Titles and URL for Custom Question 4
    checkQuestionTitlesAndURL(
      'CUSTOM_SECTION_1',
      'CUSTOM_CUSTOM_QUESTION_4',
      'Please provide the date of your last awarded grant'
    );

    // Check user cannot save and continue or save and exit without input
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]').clear();
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]').clear();
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.get('[data-cy="cyErrorBanner"]').should('exist');
    cy.get('[data-cy="cyErrorBannerHeading"]').should(
      'have.text',
      'There is a problem'
    );
    cy.get('[data-cy=cyError_CUSTOM_CUSTOM_QUESTION_4-date]').should(
      'have.text',
      'You must enter a date'
    );
    cy.get(
      '[data-cy=cy-CUSTOM_CUSTOM_QUESTION_4-input-validation-error-details]'
    ).should('have.text', 'Error: You must enter a date');

    cy.get('[data-cy=cy-back-button]').click();

    cy.url()
      .should('include', 'CUSTOM_SECTION_1')
      .and('include', 'CUSTOM_APPLICANT_ORG_CHARITY_NUMBER');

    cy.get('[data-cy="cy-checkbox-value-Non-limited company"]').should(
      'be.checked'
    );

    cy.get('[data-cy="cy-checkbox-value-Registered charity"]').should(
      'be.checked'
    );

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_CUSTOM_QUESTION_4`
    );
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]').clear();
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]').clear();
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]').clear();

    cy.get('[data-cy="cyErrorBanner"]').should('not.exist');
    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.get('[data-cy="cyErrorBanner"]').should('exist');
    cy.get('[data-cy="cyErrorBannerHeading"]').should(
      'have.text',
      'There is a problem'
    );
    cy.get('[data-cy=cyError_CUSTOM_CUSTOM_QUESTION_4-date]').should(
      'have.text',
      'You must enter a date'
    );
    cy.get(
      '[data-cy=cy-CUSTOM_CUSTOM_QUESTION_4-input-validation-error-details]'
    ).should('have.text', 'Error: You must enter a date');

    // Check and Edit Custom Question 3
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]')
      .clear()
      .type('1');
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]')
      .clear()
      .type('1');
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]')
      .clear()
      .type('2021');

    cy.get('[data-cy="cy-button-save-and-exit"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_CUSTOM_QUESTION_4`
    );

    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]').should(
      'have.value',
      '1'
    );
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]').should(
      'have.value',
      '1'
    );
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]').should(
      'have.value',
      '2021'
    );

    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]')
      .clear()
      .type('2');
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]')
      .clear()
      .type('2');
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]')
      .clear()
      .type('2022');

    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.url()
      .should('include', 'submissions')
      .and('include', 'sections')
      .and('not.include', 'questions');

    cy.visit(
      `submissions/${submissionId}/sections/CUSTOM_SECTION_1/questions/CUSTOM_CUSTOM_QUESTION_4`
    );

    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Day]').should(
      'have.value',
      '2'
    );
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Month]').should(
      'have.value',
      '2'
    );
    cy.get('[data-cy=cyDateFilter-CUSTOM_CUSTOM_QUESTION_4Year]').should(
      'have.value',
      '2022'
    );
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    // Check summary of Project Information
    cy.get('[data-cy="cy-manage-section-header"]').should(
      'have.text',
      'Summary of Project Information'
    );
    run_accessibility();

    // Check that you can edit a field
    cy.get(
      '[data-cy="cy-section-details-navigation-CUSTOM_APPLICANT_ORG_NAME"]'
    ).click();
    cy.wait(1000);
    cy.get('[data-cy="cy-CUSTOM_APPLICANT_ORG_NAME-question-title"]').should(
      'contain',
      'Enter the name of your organisation'
    );
    cy.get('[data-cy="cy-CUSTOM_APPLICANT_ORG_NAME-text-input"]').should(
      'have.value',
      'Name of Organisation'
    );
    cy.get('[data-cy="cy-CUSTOM_APPLICANT_ORG_NAME-text-input"]')
      .clear()
      .type('49000');
    cy.get('[data-cy="cy-button-cancel"]').click();

    // change and submit the values

    cy.get('[data-cy="cy-isComplete-question-title"]').should(
      'have.text',
      'Have you completed this section?'
    );
    cy.get('[data-cy="cy-section-value-Name of Organisation"]').should(
      'contain',
      'Name of Organisation'
    );

    cy.get(
      '[data-cy="cy-section-details-navigation-CUSTOM_APPLICANT_ORG_NAME"]'
    ).click();
    cy.get('[data-cy="cy-CUSTOM_APPLICANT_ORG_NAME-text-input"]').should(
      'have.value',
      'Name of Organisation'
    );
    cy.get('[data-cy="cy-CUSTOM_APPLICANT_ORG_NAME-text-input"]')
      .clear()
      .type('Name of Organisations');
    cy.get('[data-cy="cy-button-save-and-continue"]').click();

    cy.get('[data-cy="cy-isComplete-question-title"]').should(
      'have.text',
      'Have you completed this section?'
    );
    cy.get('[data-cy="cy-section-value-Name of Organisations"]').should(
      'contain',
      'Name of Organisations'
    );

    // TODO: Summary check for all fields

    cy.get('[data-cy="cy-isComplete-question-title"]').should(
      'have.text',
      'Have you completed this section?'
    );
    cy.get('[data-cy="cy-radioInput-label-YesIveCompletedThisSection"]').should(
      'have.text',
      `Yes, I've completed this section`
    );
    cy.get('[data-cy="cy-radioInput-label-NoIllComeBackLater"]').should(
      'have.text',
      `No, I'll come back later`
    );
    cy.get('[data-cy="cy-submit-application-button"]').click();

    checkErrorBanner(
      'isComplete',
      `Select 'Yes, I've completed this section' or 'No, I'll come back later'`,
      true
    );

    cy.get(
      '[data-cy="cy-radioInput-option-YesIveCompletedThisSection"]'
    ).click();

    cy.get('[data-cy="cy-submit-application-button"]').click();

    cy.get('[data-cy="cy-status-tag-Project Information-Completed"]').should(
      'have.text',
      'Completed'
    );
  });
});
