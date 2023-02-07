import sortViolation from './sortViolations';
import accessibilityLogInfo from './accessibilityLogInfo';

export default function accessibilityLog(violations) {
  cy.task('log', accessibilityLogInfo(violations.length));
  const violationData = violations.map(({ impact, description, tags }) => ({
    impact,
    description,
    tags: tags.toString(),
  }));
  sortViolation(violationData);
  cy.task('table', violationData);
}
