import { login } from '../../utils/login';

describe('super-admin-dashboard', () => {
  beforeEach(() => {
    cy.task('db:deleteTestUsers');
    cy.task('db:addTestUsers');
    cy.task('wiremock:selectUser', 'superAdmin');
    login();
  });

  it('navigates to super admin dashboard and displays a user', () => {
    cy.url().should('include', 'super-admin-dashboard');
    cy.get('table tbody tr').contains('td', 'test-user-applicant-1@gov.uk');
  });

  it('edits a user department', () => {
    cy.url().should('include', 'super-admin-dashboard');

    // select test user from table and click 'Edit'
    cy.get('table tbody tr')
      .contains('td', 'test-user-applicant-1@gov.uk')
      .parent('tr')
      .within(() => {
        cy.get('td:last-child a').contains('Edit').click();
      });

    // click 'Change' on the department summary list item
    cy.get('[data-testid="summary-list"]')
      .should('be.visible')
      .contains('Department')
      .parent()
      .within(() => {
        cy.get('a').contains('Change').click();
      });

    cy.checkRadioInputByDataCy(
      'cy-radioInput-option-DepartmentForDigitalCultureMediaSport'
    );

    cy.clickButton('govuk-button', 'Change department');

    cy.checkTextByDataCy(
      'cy_summaryListValue_Department',
      'Department for Digital, Culture, Media & Sport'
    );
  });
});
