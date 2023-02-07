import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PreviewDetailsHeader } from './PreviewDetailsHeader';

const props = {
  grantName: 'grantName',
  grantShortDescription: 'description',
  grantApplicationOpenDate: 'openDate',
  grantApplicationCloseDate: 'closeDate',
};

describe('PreviewDetailsHeader', () => {
  it('should display the page header content', async () => {
    render(<PreviewDetailsHeader {...props} />);
    const list = screen.getByRole('list');
    const openingDate = list.children[0];
    const closingDate = list.children[1];
    screen.getByText(/how your advert looks to applicants/i);
    screen.getByRole('heading', {
      name: /advert details page/i,
    });
    screen.getByText(
      /this is what applicants will see if they select your advert\./i
    );
    screen.getByText(
      /the preview below shows all the information you have entered so far\./i
    );
    screen.getByRole('heading', {
      name: /grantname/i,
    });
    screen.getByText(/description/i);
    expect(list.children).toHaveLength(2);
    expect(openingDate).toHaveTextContent('Opening date: openDate');
    expect(closingDate).toHaveTextContent('Closing date: closeDate');
  });
});
