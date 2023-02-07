import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BuildApplicationForm from './BuildApplicationForm';

describe('BuildApplicationForm', () => {
  beforeEach(() => {
    render(<BuildApplicationForm schemeId="12345" />);
  });

  it('Should render a "Build application form" button', () => {
    expect(
      screen.getByRole('button', { name: 'Build application form' })
    ).toHaveAttribute(
      'href',
      '/apply/build-application/name?grantSchemeId=12345'
    );
  });
});
