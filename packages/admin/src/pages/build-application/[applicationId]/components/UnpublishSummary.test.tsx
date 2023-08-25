import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import UnpublishSummary from './UnpublishSummary';

describe('UnpublishSummary component', () => {
  beforeEach(() => {
    render(
      <UnpublishSummary
        applicationId="testApplicationId"
        grantSchemeId="testGrantSchemeId"
      />
    );
  });

  it('Should render a link to add the application form to your grant advert, along with a description', () => {
    screen.getByRole('heading', {
      name: 'Add this application form to your grant advert?',
    });

    expect(
      screen.getByRole('link', {
        name: 'http://localhost:3000/applications/testApplicationId',
      })
    ).toHaveAttribute(
      'href',
      'http://localhost:3000/applications/testApplicationId'
    );
  });

  it('Should render an unpublish button', () => {
    screen.getByRole('heading', { name: 'Unpublish this application form?' });
    expect(screen.getByRole('button', { name: 'Unpublish' })).toHaveAttribute(
      'href',
      '/apply/build-application/testApplicationId/unpublish-confirmation'
    );
  });

  it('Should render an exit button', () => {
    expect(screen.getByRole('link', { name: 'Exit' })).toHaveAttribute(
      'href',
      '/apply/scheme/testGrantSchemeId'
    );
  });

  it('Should render some links to Find a grant', () => {
    screen.getByRole('link', { name: 'Find a grant' });
    screen.getAllByRole('link', { name: 'Find a grant' }).forEach((link) => {
      expect(link).toHaveAttribute(
        'href',
        'https://www.find-government-grants.service.gov.uk'
      );
    });
  });
});
