import { render, screen } from '@testing-library/react';
import { Pagination } from './Pagination';
import '@testing-library/jest-dom';

const mockProps = {
  itemsPerPage: 10,
  totalItems: 31,
  itemType: 'items',
  searchParams: {
    page: 1,
  },
  route: 'test',
};

describe('Testing Pagination component behaviour', () => {
  it.skip('check pagination with default value ie at page 1', async () => {
    render(<Pagination {...mockProps} />);
    expect(screen.queryByText(/Next/)).toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
  });

  it('check pagination when at page 2', async () => {
    render(<Pagination {...mockProps} />);
    //TODO: We don't use this coponent
    // expect(screen.queryByText(/Next/)).toBeInTheDocument();
    // expect(screen.queryByText(/Next/)).toHaveAttribute(
    //   'href',
    //   '/?skip=20&limit=10&page=3'
    // );
    // expect(screen.queryByText(/Previous/)).toBeInTheDocument();
    // expect(screen.queryByText(/Previous/)).toHaveAttribute(
    //   'href',
    //   '/?skip=0&limit=10&page=1'
    // );
    expect(screen.queryByText('2')).toHaveClass(
      'govuk-link govuk-pagination__link'
    );
  });

  it('check pagination when at last page', async () => {
    render(<Pagination {...mockProps} searchParams={{ page: 4 }} />);
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).toBeInTheDocument();
    //TODO: We don't use this coponent
    // expect(screen.queryByText(/Previous/)).toHaveAttribute(
    //   'href',
    //   '/?skip=20&limit=10&page=3'
    // );
    // expect(screen.queryByText('4')).toHaveClass(
    //   'moj-pagination__item moj-pagination__item--active'
    // );
  });

  it('should only render result count when total items less than items per page', async () => {
    const getByTextContent = (text) =>
      screen.getByText(
        (_, element) =>
          element.textContent === text &&
          Array.from(element.children || []).every(
            (node) => node.textContent !== text
          )
      );

    render(<Pagination {...mockProps} totalItems={9} />);
    expect(getByTextContent('Showing 1 to 9 of 9 items')).toBeVisible();
  });

  it('random check: pagination if it has ellipsis or not: PAGE count: 10, current page: 5', async () => {
    const mockProps1 = {
      itemsPerPage: 10,
      totalItems: 100,
      itemType: 'items',
      searchParams: { page: 5 },
    };
    render(<Pagination {...mockProps1} />);

    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "Previous",
          "1",
          "...",
          "4",
          "5",
          "6",
          "...",
          "10",
          "Next",
        ]
      `);
  });

  it('check pagination if it has ellipsis or not: PAGE count: 5, current page: 1', async () => {
    const mockProps2 = {
      itemsPerPage: 10,
      totalItems: 49,
      itemType: 'items',
      searchParams: { page: 1 },
    };

    render(<Pagination {...mockProps2} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "1",
          "2",
          "3",
          "4",
          "5",
          "Next",
        ]
      `);
  });

  it('random check: pagination if it has double ellipsis or not: PAGE count: 10, current page: 5', async () => {
    const mockProps_10Page = {
      itemsPerPage: 10,
      totalItems: 99,
      itemType: 'items',
    };

    render(<Pagination {...mockProps_10Page} searchParams={{ page: 5 }} />);
    // screen.debug();
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "Previous",
          "1",
          "...",
          "4",
          "5",
          "6",
          "...",
          "10",
          "Next",
        ]
      `);
  });

  it.skip('check navigation with no props ie default value', async () => {
    const { container } = render(<Pagination />);
    // checking if component returns null when pagination is not required
    expect(container.firstChild).toBeNull();
  });
});

describe('Testing Pagination component: Covering Edge cases for 7 set of pages, with first, last and middle as current Page', () => {
  const mockProps_1 = {
    itemsPerPage: 10,
    totalItems: 68,
    itemType: 'items',
  };

  it('In 7 set of pages, testing pagination list items when current page is 1', async () => {
    render(<Pagination {...mockProps_1} searchParams={{ page: 1 }} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "1",
          "2",
          "3",
          "...",
          "7",
          "Next",
        ]
      `);
  });

  it('In 7 set of pages, testing pagination list items when current page is 4', async () => {
    render(<Pagination {...mockProps_1} searchParams={{ page: 4 }} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "Previous",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "Next",
        ]
      `);
  });

  it('In 7 set of pages, testing pagination list items when current page is 7', async () => {
    render(<Pagination {...mockProps_1} searchParams={{ page: 7 }} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        [
          "Previous",
          "1",
          "...",
          "5",
          "6",
          "7",
        ]
      `);
  });
});
