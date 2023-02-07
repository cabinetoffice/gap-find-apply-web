import run_accessibility from '../../utils/accessibility';
import resetSubmissionTables from '../../utils/resetSubmissionTables';
import resetGrantScheme from '../../utils/resetGrantScheme';
import getLoginCookie from '../../utils/getLoginCookie';
import { connection } from '../../constants/constants.js';

// use test-data.sql for these tests

describe('Submission test', () => {
  beforeEach(() => {
    getLoginCookie();
    resetSubmissionTables();
    resetGrantScheme();
    cy.visit('/applications');
  });

  afterEach(() => {
    resetSubmissionTables();
  });

  it('should not allow you, or allow, you to visit the submit page via url depending if your application is ready', () => {
    // This application ID is not ready for submission
    cy.visit('/submissions/3a6cfe2d-bf58-440d-9e07-3579c7dcf205/sections');
    run_accessibility();
    cy.visit('/submissions/3a6cfe2d-bf58-440d-9e07-3579c7dcf205/submit');
    cy.url().should('include', 'sections');

    // This application ID is ready for submission
    cy.visit('/submissions/3a6cfe2d-bf58-440d-9e07-3579c7dcf207/sections');
    cy.visit('/submissions/3a6cfe2d-bf58-440d-9e07-3579c7dcf207/submit');
    cy.url().should('include', 'submissions').and('include', 'submit');

    cy.get('[data-cy=cy-confirm-submit-submission-title]').should(
      'have.text',
      'Are you sure you want to submit this application?'
    );
    cy.get('[data-cy=cy-confirm-submit-submission-hint]').should(
      'have.text',
      'You will not be able to make changes to your application after this has been submitted.'
    );
    cy.get('[data-cy="cy-confirm-submit-submission-button"]').should('exist');
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

    cy.get('[data-cy="cy-application-link-Test Grant Application"]').should(
      'have.text',
      'Test Grant Application'
    );

    // TODO add more grants
    run_accessibility();
  });

  it('Should not submit because the mandatory question are not completed', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application 4"]').click();
    run_accessibility();
    cy.get('[data-cy="cy-save-and-come-back-later"]').click();
    cy.url().should('contain', '/applications');
    cy.get('[data-cy="cy-application-link-Test Grant Application 4"]').click();
    cy.get('[data-cy="cy-submit-application-button"]').should('be.disabled');
  });

  it('Should not submit if the application is not published', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application"]').click();
    cy.get('[data-cy="cy-save-and-come-back-later"]').click();
    cy.url().should('contain', '/applications');
    cy.get('[data-cy="cy-application-link-Test Grant Application"]').click();
    run_accessibility();
    cy.get('[data-cy="cy-submit-application-button"]').should('be.disabled');
  });

  it('Should show a help email if provided', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application"]').click();
    cy.get('[data-cy="cy-support-email"]').should(
      'contain',
      'grantadmin@and.digital'
    );
    run_accessibility();

    cy.task('dbQuery', {
      query: `UPDATE grant_scheme SET scheme_contact=null WHERE grant_scheme_id=1`,
      connection: connection,
    });
    cy.wait(3000);
    cy.visit('/applications');
    cy.get('[data-cy="cy-support-email"]').should('not.exist');
    resetGrantScheme();
  });

  it('Should submit application', () => {
    cy.get('[data-cy="cy-application-link-Test Grant Application 3"]').click();
    cy.get('[data-cy="cy-save-and-come-back-later"]').click();
    cy.url().should('contain', '/applications');
    cy.get('[data-cy="cy-application-link-Test Grant Application 3"]').click();
    cy.get('[data-cy="cy-submit-application-link"]').click();
    run_accessibility();
    cy.url().should('include', 'submissions').and('include', 'submit');

    cy.get('[data-cy=cy-confirm-submit-submission-title]').should(
      'have.text',
      'Are you sure you want to submit this application?'
    );
    cy.get('[data-cy=cy-confirm-submit-submission-hint]').should(
      'have.text',
      'You will not be able to make changes to your application after this has been submitted.'
    );
    cy.get('[data-cy="cy-cancel-submission"]').click();
    cy.url().should('include', 'submissions').and('include', 'sections');
    cy.get('[data-cy="cy-submit-application-link"]').click();
    cy.get('[data-cy="cy-confirm-submit-submission-button"]').click();

    cy.url().should('contain', 'equality-and-diversity');
    run_accessibility();

    cy.get('[data-cy="cy-equality-and-diversity-header"]').should(
      'have.text',
      'We have received your application'
    );
    cy.get('[data-cy="cy-equality-and-diversity-paragraph"]').should(
      'have.text',
      'Before you finish using the service, we’d like to ask some equality questions.'
    );
    cy.get('[data-cy="cy-hasProvidedAdditionalAnswers-question-title"]').should(
      'have.text',
      'Do you want to answer the equality questions?'
    );
    cy.get('[data-cy="cy-equality-and-diversity-hint-paragraph-1"]').should(
      'have.text',
      'These questions are optional. We would like to understand who the grant will benefit.'
    );
    cy.get('[data-cy="cy-equality-and-diversity-hint-paragraph-2"]').should(
      'have.text',
      'Your answers will not affect your application.'
    );
    cy.get(
      '[data-cy="cy-radioInput-option-NoSkipTheEqualityQuestions"]'
    ).click();

    cy.get('[data-cy="cy-continue-button"]').click();

    cy.url().should('include', 'submission-confirmation');
    run_accessibility();

    cy.get('[data-cy="cy-application-submitted-banner"]').contains(
      'Application submitted'
    );
    cy.get('[data-cy="cy-application-submitted-header"]').contains(
      'What happens next'
    );
    cy.get('[data-cy="cy-application-submitted-description"]').contains(
      'The funding organisation will contact you once they have reviewed your application.'
    );

    cy.wait(3000);
    cy.task('dbQuery', {
      query: "SELECT * FROM grant_submission WHERE status='SUBMITTED'",
      connection: connection,
    }).then((queryResponse) => {
      const response = queryResponse[0];
      expect(response.application_id).to.equal(2);
      expect(response.application_name).to.equal('Test Grant Application 3');
      expect(response.status).to.equal('SUBMITTED');
      expect(response.id).to.equal('3a6cfe2d-bf58-440d-9e07-3579c7dcf207');
    });

    cy.task('dbQuery', {
      query:
        "SELECT * FROM diligence_check WHERE submission_id='3a6cfe2d-bf58-440d-9e07-3579c7dcf207'",
      connection: connection,
    }).then((queryResponse) => {
      const response = queryResponse[0];
      expect(response.submission_id).to.equal(
        '3a6cfe2d-bf58-440d-9e07-3579c7dcf207'
      );

      expect(queryResponse).to.have.lengthOf(1);
      expect(response.address_county).to.equal('Glasgow');
      expect(response.address_postcode).to.equal('EH2 2AF');
      expect(response.address_street).to.equal('9-10 St Andrew Square');
      expect(response.address_town).to.equal('Edinburgh');
      expect(response.application_amount).to.equal('500');

      expect(response.charity_number).to.equal('55667788');
      expect(response.check_type).to.equal(1);
      expect(response.companies_house_number).to.equal('Yes');

      expect(response.organisation_name).to.equal('Some company name');
    });

    cy.task('dbQuery', {
      query:
        "SELECT * FROM grant_beneficiary WHERE submission_id='3a6cfe2d-bf58-440d-9e07-3579c7dcf207'",
      connection: connection,
    }).then((queryResponse) => {
      const response = queryResponse[0];
      expect(response.submission_id).to.equal(
        '3a6cfe2d-bf58-440d-9e07-3579c7dcf207'
      );
      expect(response.scheme_id).to.equal(1);
      expect(response.application_id).to.equal(2);
      expect(response.location_ne_eng).to.equal(false);
      expect(response.location_nw_eng).to.equal(false);
      expect(response.location_se_eng).to.equal(false);
      expect(response.location_sw_eng).to.equal(false);
      expect(response.location_mid_eng).to.equal(false);
      expect(response.location_sco).to.equal(true);
      expect(response.location_wal).to.equal(true);
      expect(response.location_nir).to.equal(false);
      expect(queryResponse).to.have.lengthOf(1);
    });

    cy.get(
      '[data-cy="cy-application-submitted-view-applications-link"]'
    ).click();

    cy.url().should('contain', '/applications');

    cy.get('[data-cy="cy-application-link-Test Grant Application 3"]').should(
      'not.have.attr',
      'href'
    );

    resetSubmissionTables();
  });
});
