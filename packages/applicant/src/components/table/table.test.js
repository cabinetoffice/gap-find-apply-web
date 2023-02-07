import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Table } from '.';

var mockRows = [
  {
    cells: [
      {
        children: 'January',
      },
      {
        children: '23000',
        format: 'numeric',
      },
      {
        children: '45000',
        format: 'numeric',
      },
    ],
  },
  {
    cells: [
      {
        children: 'February',
      },
      {
        children: '12000',
        format: 'numeric',
      },
      {
        children: '15000',
        format: 'numeric',
      },
    ],
  },
];

const mockHeadRow = [
  {
    children: 'Month you apply',
  },
  {
    children: 'Rate for bicycles',
    format: 'numeric',
  },
  {
    children: 'Rate for vehicles',
    format: 'numeric',
  },
];
const customProps = {
  caption: 'Test Caption',
  captionClassName: 'table',
  className: 'table',
  rows: mockRows,
  head: mockHeadRow,
  firstCellIsHeader: false,
};
describe('Testing Table component', () => {
  beforeAll(async () => {});
  it('renders a caption', async () => {
    render(<Table {...customProps} />);
    const heading = screen.getAllByText(/Test Caption/);
    expect(heading).toHaveLength(1);
  });

  it('renders the first row', async () => {
    render(<Table {...customProps} />);
    const row1_col1 = screen.getAllByText(/January/);
    expect(row1_col1).toHaveLength(1);

    const row1_col2 = screen.getAllByText(/23000/);
    expect(row1_col2).toHaveLength(1);
  });

  it('renders the heading row', async () => {
    render(<Table {...customProps} />);
    const head_col1 = screen.getAllByText(/Month you apply/);
    expect(head_col1).toHaveLength(1);

    const head_col2 = screen.getAllByText(/Rate for bicycles/);
    expect(head_col2).toHaveLength(1);
  });

  it('renders the table with first row as header', async () => {
    const newProps = {
      ...customProps,
      head: [],
      firstCellIsHeader: true,
    };
    render(<Table {...newProps} />);
    const headClassName = screen.getByText(/January/);
    expect(headClassName).toHaveClass('govuk-table__header');
  });

  it('renders the table with no rows', async () => {
    const newProps = {
      ...customProps,
      rows: undefined,
    };
    render(<Table {...newProps} />);
    const row1 = screen.queryByText(/January/);
    expect(row1).not.toBeInTheDocument();
  });

  it('renders the table with no captionClassName', async () => {
    const newProps = {
      ...customProps,
      captionClassName: undefined,
    };
    render(<Table {...newProps} />);
    let className = screen.getByText(/Test Caption/).getAttribute('class');
    className = className.split(' ')[1].split('-');
    expect(className.includes('table')).toBeFalsy;
  });
});
