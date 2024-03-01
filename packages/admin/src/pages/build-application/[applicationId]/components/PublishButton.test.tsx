import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import PublishButton from './PublishButton';

describe('PublicButton component', () => {
  it('Should render a description of the buttons', () => {
    render(
      <PublishButton
        applicationId="testApplicationId"
        grantSchemeId="testGrantSchemeId"
        disabled={false}
      />
    );
    screen.getByText('Have you finished building your application form?');
    screen.getByText(
      'If you have finished building your application form, you can publish it.'
    );
  });

  it('Should render an enabled publish button', () => {
    render(
      <PublishButton
        applicationId="testApplicationId"
        grantSchemeId="testGrantSchemeId"
        disabled={false}
      />
    );
    const button = screen.getByRole('button', { name: 'Publish' });
    expect(button).toHaveAttribute(
      'href',
      '/apply/admin/build-application/testApplicationId/publish-confirmation'
    );
    expect(button).not.toHaveAttribute('disabled');
  });

  it('Should render a disabled publish button', () => {
    render(
      <PublishButton
        applicationId="testApplicationId"
        grantSchemeId="testGrantSchemeId"
        disabled={true}
      />
    );
    const button = screen.getByRole('button', { name: 'Publish' });
    expect(button).toHaveAttribute('disabled');
  });

  it('Should render an exit link', () => {
    render(
      <PublishButton
        applicationId="testApplicationId"
        grantSchemeId="testGrantSchemeId"
        disabled={false}
      />
    );
    expect(screen.getByRole('link', { name: 'Exit' })).toHaveAttribute(
      'href',
      '/apply/admin/scheme/testGrantSchemeId'
    );
  });
});
