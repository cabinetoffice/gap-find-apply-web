import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { GovLink, LinkType } from '../link/GovLink';

const component = <GovLink text="Cancel" url="/applicant/organisation" />;
describe('Gov link component', () => {
  it('should display link without no visit state class', () => {
    render(component);
    expect(screen.getByRole('link', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /cancel/i })).not.toHaveAttribute(
      'class',
      'govuk-link govuk-link--no-visited-state'
    );
  });

  it('should have href with url', () => {
    render(component);
    expect(screen.getByRole('link', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'href',
      '/applicant/organisation'
    );
  });

  it('should display link with no visit state class', () => {
    render(
      <GovLink
        text="Cancel"
        url="/applicant/organisation"
        noVisitedState={true}
      />
    );
    expect(screen.getByRole('link', { name: /cancel/i })).toBeDefined();
    expect(screen.getByRole('link', { name: /cancel/i })).toHaveAttribute(
      'class',
      'govuk-link govuk-link--no-visited-state'
    );
  });
});
