import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RelatedContent from '../related-content';
import SignupConfirmation from './SignupConfirmation';

const component = (
  <SignupConfirmation
    signedUpEmail="test@email.com"
    subscribedTo="Test Subscription"
    returnParams={{ href: '/test/url', linkText: 'Back to another page' }}
  />
);

describe('Rendering Signup Confirmation Component', () => {
  it('Should render appropriate confirmation content', async () => {
    render(component);
    const header = screen.getByRole('heading', { name: 'Check your email' });
    expect(header).toBeDefined();
    expect(header).toHaveAttribute('tabIndex', '-1');
    expect(header).toHaveAttribute('id', 'main-content-focus');

    expect(screen.getByTestId('email')).toBeDefined();

    const noEmailText = screen.getByRole('group');
    expect(noEmailText).toBeDefined();
    expect(noEmailText).toHaveAttribute('data-module', 'govuk-details');
  });

  it('Should render the signup to text in bold', () => {
    render(
      <SignupConfirmation
        signedUpEmail="test@email.com"
        subscribedTo="Test Subscription"
        displayBold={true}
        returnParams={{ href: '/test/url', linkText: 'Back to another page' }}
      />
    );
    const signedUpTo = screen.getByTestId('signed_up_to_bold');
    expect(signedUpTo).toBeDefined();
    expect(signedUpTo).toHaveTextContent('Test Subscription');
  });

  it('Should render the signup to text within text body', () => {
    render(component);
    const signedUpTo = screen.getByTestId('signed_up_to_text');
    expect(signedUpTo).toBeDefined();
    expect(signedUpTo).toHaveTextContent('Test Subscription');

    expect(screen.queryByTestId('signed_up_to_bold')).toBe(null);
  });

  it('Should render return link with values provided', () => {
    render(component);
    const returnLink = screen.getByText('Back to another page');
    expect(returnLink).toBeDefined();
    expect(returnLink).toHaveAttribute('href', '/test/url');
  });

  it('Should render child components when provided', () => {
    render(
      <SignupConfirmation
        signedUpEmail="test@email.com"
        subscribedTo="Test Sunscription"
        returnParams={{ href: '/test/url', linkText: 'Back to another page' }}
      >
        <RelatedContent
          links={[{ title: 'Similar Page', href: '/similarPage' }]}
        />
      </SignupConfirmation>
    );

    expect(
      screen.getByRole('heading', { name: 'Related content' })
    ).toBeDefined();
  });
});
