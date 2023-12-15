import '@testing-library/jest-dom';
import { merge } from 'lodash';
import { render, screen } from '@testing-library/react';
import { ReviewAndPublishButtonGroup } from './ReviewAndPublishButtonGroup';

const getProps = (overrides: any = {}) =>
  merge(
    {
      schemeId: 'schemeId',
      advertId: 'advertId',
      isPublishDisabled: false,
    },
    overrides
  );
describe('ReviewAndPublishButtonGroup', () => {
  it('Should render the Exit link and have the right href', () => {
    render(<ReviewAndPublishButtonGroup {...getProps()} />);

    const exitLink = screen.getByRole('link', {
      name: /Go back to view Scheme page/i,
    });
    expect(exitLink).toHaveAttribute('href', '/apply/scheme/schemeId');
  });

  it('Should render "Review and publish" button with the right href', () => {
    render(<ReviewAndPublishButtonGroup {...getProps()} />);

    const publishButton = screen.getByRole('button', {
      name: 'Review and publish',
    });

    expect(publishButton).toHaveAttribute(
      'href',
      '/apply/scheme/schemeId/advert/advertId/summary'
    );
  });

  it('Should render a disabled "Review and publish" button with no href', () => {
    render(
      <ReviewAndPublishButtonGroup {...getProps({ isPublishDisabled: true })} />
    );

    const publishButton = screen.getByRole('button', {
      name: 'Review and publish',
    });

    expect(publishButton).toHaveAttribute('disabled');
    expect(publishButton).not.toHaveAttribute('href');
  });
});
