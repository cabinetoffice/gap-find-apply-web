import { wcagCategories } from '../constants/constants';
import accessibilityLog from '../utils/accessibilityLog';

export default function run_accessibility() {
  cy.injectAxe();
  cy.checkA11y(null, wcagCategories, accessibilityLog);
}
