import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PreviewDetailsTab } from './PreviewDetailsTab';

const props = {
  tabs: [
    { name: 'tab1', content: '' },
    {
      name: 'tab2',
      content:
        '{"nodeType":"document","data":{},"content":[{"nodeType":"paragraph","content":[{"nodeType":"text","value":"content2","marks":[],"data":{}}],"data":{}}]}',
    },
  ],
};

describe('PreviewDetailsTab', () => {
  beforeEach(() => {
    render(<PreviewDetailsTab {...props} />);
  });
  it('should display the tab content', async () => {
    screen.getByTestId('advert-preview-tabs-div');
    screen.getByTestId('tab1-content-div');
    screen.getByTestId('tab2-content-div');
    screen.getByRole('heading', { name: 'tab2' });
    screen.getByText('content2');
  });

  it('should display tab headers', () => {
    const list = screen.getByRole('list');
    expect(list.children).toHaveLength(2);
    expect(list.children[0]).toHaveTextContent('tab1');
    expect(list.children[1]).toHaveTextContent('tab2');
  });
});
