import { render, screen } from '@testing-library/react';
import { Pagination } from '../../src/components/pagination/Pagination';
import '@testing-library/jest-dom';

import { useRouter } from 'next/router';

jest.mock('next/router', () => {
  return {
    useRouter: jest.fn(),
  };
});

const mockProps = {
  itemsPerPage: 10,
  totalItems: 31,
  itemType: 'items',
};

describe('Testing Pagination component behaviour', () => {
  const pushMock = jest.fn();
  beforeAll(async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {},
      push: pushMock,
    });
  });

  it('check pagination with default value ie at page 1', async () => {
    render(<Pagination {...mockProps} />);
    expect(screen.queryByText(/Next/)).toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).not.toBeInTheDocument();
  });

  it('check pagination when at page 2', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 10,
        limit: 10,
        page: 2,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps} />);
    expect(screen.queryByText(/Next/)).toBeInTheDocument();
    expect(screen.queryByText(/Next/)).toHaveAttribute(
      'href',
      '/?skip=20&limit=10&page=3'
    );
    expect(screen.queryByText(/Previous/)).toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).toHaveAttribute(
      'href',
      '/?skip=0&limit=10&page=1'
    );
    expect(screen.queryByText('2')).toHaveClass(
      'moj-pagination__item moj-pagination__item--active'
    );
  });

  it('check pagination when at last page', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 30,
        limit: 10,
        page: 4,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps} />);
    expect(screen.queryByText(/Next/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).toBeInTheDocument();
    expect(screen.queryByText(/Previous/)).toHaveAttribute(
      'href',
      '/?skip=20&limit=10&page=3'
    );
    expect(screen.queryByText('4')).toHaveClass(
      'moj-pagination__item moj-pagination__item--active'
    );
  });

  it('random check: pagination should not be rendered when total records is less than records per page', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {},
      push: pushMock,
    });
    const { container } = render(<Pagination {...mockProps} totalItems={9} />);
    // checking if component returns null when pagination is not required
    expect(container.firstChild).toBeNull();
  });

  it('random check: pagination if it has ellipsis or not: PAGE count: 10, current page: 5', async () => {
    const mockProps1 = {
      itemsPerPage: 10,
      totalItems: 100,
      itemType: 'items',
    };
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 40,
        limit: 10,
        page: 5,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps1} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "Previous set of pages",
          "1",
          "...",
          "4",
          "5",
          "6",
          "...",
          "10",
          "Next set of pages",
        ]
      `);
  });

  it('check pagination if it has ellipsis or not: PAGE count: 5, current page: 1', async () => {
    const mockProps2 = {
      itemsPerPage: 10,
      totalItems: 49,
      itemType: 'items',
    };
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 0,
        limit: 10,
        page: 1,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps2} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "1",
          "2",
          "3",
          "4",
          "5",
          "Next set of pages",
        ]
      `);
  });

  it('random check: pagination if it has double ellipsis or not: PAGE count: 10, current page: 5', async () => {
    const mockProps_10Page = {
      itemsPerPage: 10,
      totalItems: 99,
      itemType: 'items',
    };
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 40,
        limit: 10,
        page: 5,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps_10Page} />);
    // screen.debug();
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "Previous set of pages",
          "1",
          "...",
          "4",
          "5",
          "6",
          "...",
          "10",
          "Next set of pages",
        ]
      `);
  });

  it('check navigation with no props ie default value', async () => {
    const { container } = render(<Pagination />);
    // checking if component returns null when pagination is not required
    expect(container.firstChild).toBeNull();
  });
});

describe('Testing Pagination component: Covering Edge cases for 7 set of pages, with first, last and middle as current Page', () => {
  const pushMock = jest.fn();
  const mockProps_1 = {
    itemsPerPage: 10,
    totalItems: 68,
    itemType: 'items',
  };

  it('In 7 set of pages, testing pagination list items when current page is 1', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 0,
        limit: 10,
        page: 1,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps_1} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "1",
          "2",
          "3",
          "...",
          "7",
          "Next set of pages",
        ]
      `);
  });

  it('In 7 set of pages, testing pagination list items when current page is 4', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 30,
        limit: 10,
        page: 4,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps_1} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "Previous set of pages",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "Next set of pages",
        ]
      `);
  });

  it('In 7 set of pages, testing pagination list items when current page is 7', async () => {
    useRouter.mockReturnValue({
      pathname: 'test',
      query: {
        skip: 30,
        limit: 10,
        page: 7,
      },
      push: pushMock,
    });
    render(<Pagination {...mockProps_1} />);
    const items = screen.getAllByRole('listitem');
    const listItems = items.map((item) => item.textContent);
    expect(listItems).toMatchInlineSnapshot(`
        Array [
          "Previous set of pages",
          "1",
          "...",
          "5",
          "6",
          "7",
        ]
      `);
  });
});
