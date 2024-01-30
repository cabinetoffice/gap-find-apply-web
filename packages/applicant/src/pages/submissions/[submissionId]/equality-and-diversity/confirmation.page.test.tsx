import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import { createMockRouter } from '../../../../testUtils/createMockRouter';
import React from 'react';
import EqualityAndDiversityConfirmationPage from './confirmation.page';

describe('Equality and diversity confirmation page', () => {
  const renderWithRouter = (ui: React.ReactNode) => {
    render(
      <RouterContext.Provider value={createMockRouter({})}>
        {ui}
      </RouterContext.Provider>
    );
  };

  const component = <EqualityAndDiversityConfirmationPage />;

  it('Should render confirmation banner', () => {
    renderWithRouter(component);
    const panel = screen.getByTestId('confirmation-panel');
    expect(panel).toHaveClass('govuk-panel', 'govuk-panel--confirmation');
    const header = screen.getByRole('heading', {
      name: 'Your answers have been submitted',
    });
    expect(header).toHaveClass('govuk-panel__title');
  });

  it('Should render sub header', () => {
    renderWithRouter(component);
    screen.getByRole('heading', { name: 'Thank you' });
  });

  it('Should render summary text', () => {
    renderWithRouter(component);
    screen.getByText(
      'Thanks for helping us understand who the grant will benefit.'
    );
    screen.getByText('Your answers will not affect your application.');
    screen.getByText(
      'The funding organisation will contact you once they have reviewed your application.'
    );
  });

  it('Should render view applications button', () => {
    renderWithRouter(component);
    const buttonToApplications = screen.getByRole('button', {
      name: 'View your applications',
    });
    expect(buttonToApplications).toHaveAttribute('href', '/applications');
  });

  it('Should render link to survey', () => {
    renderWithRouter(component);
    const linkToService = screen.getByRole('link', {
      name: 'Tell us what did you think of this service?',
    });
    expect(linkToService).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/e/1FAIpQLSeZnNVCqmtnzfZQJSBW_k9CklS2Y_ym2GRt-z0-1wf9pDEgPw/viewform'
    );
    expect(linkToService).toHaveClass('govuk-link');
  });
});
