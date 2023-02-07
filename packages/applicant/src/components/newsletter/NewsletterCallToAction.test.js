import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { NewsletterCallToAction } from './NewsletterCallToAction';

const signupTitleText = 'Get updates about new grants';
const linkToSignupText =
  'Sign up and we will email you when new grants have been added.';

describe('NewsletterCallToAction', () => {
  it('should render with correct text and a clickable link', () => {
    render(<NewsletterCallToAction returnParams={{ href: '/grants' }} />);

    expect(screen.getByText(signupTitleText)).toBeInTheDocument();
    expect(screen.getByText(linkToSignupText)).toHaveAttribute(
      'href',
      '/newsletter?href=%2Fgrants'
    );
  });
});
