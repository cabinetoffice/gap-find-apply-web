import checkErrorBanner from '../checkErrorBanner';

export default function advertCheckCompleteSection() {
  cy.get('[data-cy="cy-advert-page-save-and-continue-button"]').click();
  checkErrorBanner(
    'completed',
    "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
  );
  cy.get('[data-cy="cy-advert-page-save-and-exit-button"]').click();
  checkErrorBanner(
    'completed',
    "Select 'Yes, I've completed this question', or 'No, I'll come back later'"
  );
}
