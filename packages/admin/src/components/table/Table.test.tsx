import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Table from './Table';
import { Row, TableProps, TheadColumn } from './TableType';

const mockRows: Row[] = [
  {
    cells: [
      {
        content: 'January',
      },
      {
        content: '23000',
        classNames: 'govuk-table__cell--numeric',
        cellAttributes: {
          ['custom-attribute']: 'test-data-cy-attribute',
        },
      },
      {
        content: '45000',
        classNames: 'govuk-table__cell--numeric',
      },
    ],
  },
  {
    cells: [
      {
        content: 'February',
      },
      {
        content: '12000',
        classNames: 'govuk-table__cell--numeric',
      },
      {
        content: '15000',
        classNames: 'govuk-table__cell--numeric',
      },
    ],
  },
];

const mockHeadColumns: TheadColumn[] = [
  {
    name: 'Month you apply',
  },
  {
    name: 'Rate for bicycles',
    classNames: 'govuk-table__header--numeric',
    theadColumnAttributes: {
      ['custom-attribute']: 'test-data-cy-attribute',
    },
  },
  {
    name: 'Rate for vehicles',
    classNames: 'govuk-table__header--numeric',
  },
];

const customProps: TableProps = {
  tableName: 'Test Caption',
  tableCaptionClassName: 'govuk-table__caption--m',
  tableClassName: 'govuk-!-margin-top-5',
  tableHeadColumns: mockHeadColumns,
  rows: mockRows,
  tableAttributes: {
    ['custom-attribute']: 'test-data-cy-attribute',
  },
};

describe('Table component', () => {
  it('Renders a caption', () => {
    render(<Table {...customProps} />);
    screen.getByRole('table', { name: 'Test Caption' });
  });

  it('Renders the table with no caption', () => {
    const newProps = {
      ...customProps,
      tableName: undefined,
    };
    render(<Table {...newProps} />);

    const tableCaptionElement = screen.queryByTestId('table-caption');
    expect(tableCaptionElement).toBeFalsy();
  });

  it('Applies a custom passed in caption class', () => {
    render(<Table {...customProps} />);
    const rootTableElement = screen.getByTestId('table-caption');
    expect(rootTableElement).toHaveClass('govuk-table__caption--m');
  });

  it('Applies a custom passed in table class name', () => {
    render(<Table {...customProps} />);
    const rootTableElement = screen.getByRole('table', {
      name: 'Test Caption',
    });
    expect(rootTableElement).toHaveClass('govuk-!-margin-top-5');
  });

  it('Renders the table with a non header first row', () => {
    render(<Table {...customProps} />);
    screen.getByRole('cell', { name: 'January' });
  });

  it('Renders the table with first cell as header', () => {
    const newProps = {
      ...customProps,
      firstCellIsHeader: true,
    };
    render(<Table {...newProps} />);

    screen.getByRole('rowheader', { name: 'January' });
  });

  it('Renders the heading row', () => {
    render(<Table {...customProps} />);

    screen.getByRole('columnheader', { name: 'Month you apply' });
    screen.getByRole('columnheader', { name: 'Rate for bicycles' });
    screen.getByRole('columnheader', { name: 'Rate for vehicles' });
  });

  it('Applies passed in custom class name for the table heading cells', () => {
    render(<Table {...customProps} />);

    const headRow1_cell1 = screen.getByRole('columnheader', {
      name: 'Month you apply',
    });
    const headRow1_cell2 = screen.getByRole('columnheader', {
      name: 'Rate for bicycles',
    });
    const headRow1_cell3 = screen.getByRole('columnheader', {
      name: 'Rate for vehicles',
    });

    expect(headRow1_cell1).not.toHaveClass('govuk-table__header--numeric');
    expect(headRow1_cell2).toHaveClass('govuk-table__header--numeric');
    expect(headRow1_cell3).toHaveClass('govuk-table__header--numeric');
  });

  it('Applies passed in custom attributes for the table heading cells', () => {
    render(<Table {...customProps} />);

    const headRow1_cell1 = screen.getByRole('columnheader', {
      name: 'Month you apply',
    });
    const headRow1_cell2 = screen.getByRole('columnheader', {
      name: 'Rate for bicycles',
    });
    const headRow1_cell3 = screen.getByRole('columnheader', {
      name: 'Rate for vehicles',
    });

    expect(headRow1_cell1).not.toHaveAttribute('custom-attribute');
    expect(headRow1_cell2).toHaveAttribute(
      'custom-attribute',
      'test-data-cy-attribute'
    );
    expect(headRow1_cell3).not.toHaveAttribute('custom-attribute');
  });

  it('Applies passed in custom class name for the table body cells', () => {
    render(<Table {...customProps} />);

    const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });
    const bodyRow1_cell2 = screen.getByRole('cell', { name: '23000' });
    const bodyRow1_cell3 = screen.getByRole('cell', { name: '45000' });

    expect(bodyRow1_cell1).not.toHaveClass('govuk-table__cell--numeric');
    expect(bodyRow1_cell2).toHaveClass('govuk-table__cell--numeric');
    expect(bodyRow1_cell3).toHaveClass('govuk-table__cell--numeric');
  });

  it('Applies passed in custom attributes for the table body cells', () => {
    render(<Table {...customProps} />);

    const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });
    const bodyRow1_cell2 = screen.getByRole('cell', { name: '23000' });
    const bodyRow1_cell3 = screen.getByRole('cell', { name: '45000' });

    expect(bodyRow1_cell1).not.toHaveAttribute('custom-attribute');
    expect(bodyRow1_cell2).toHaveAttribute(
      'custom-attribute',
      'test-data-cy-attribute'
    );
    expect(bodyRow1_cell3).not.toHaveAttribute('custom-attribute');
  });

  it('Applies passed in custom attributes for the table body', () => {
    render(<Table {...customProps} />);

    const rootTableElement = screen.getByRole('table', {
      name: 'Test Caption',
    });

    expect(rootTableElement).toHaveAttribute(
      'custom-attribute',
      'test-data-cy-attribute'
    );
  });

  it('table tag should have no tableClassName if not passed', () => {
    const { tableClassName, ...otherProps } = customProps;
    render(<Table {...otherProps} />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('class', 'govuk-table ');
  });

  it('table tag should have no tableCaptionClassName if not passed', () => {
    const { tableCaptionClassName, ...otherProps } = customProps;
    render(<Table {...otherProps} />);
    const caption = screen.getByTestId('table-caption');
    expect(caption).toHaveAttribute('class', 'govuk-table__caption ');
  });

  it('should have the last column aligned to right if isLastCellAStatusTag is true and if the cell is the last column', () => {
    const props = { ...customProps, isLastCellAStatusTag: true };
    render(<Table {...props} />);

    const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });
    const bodyRow1_cell2 = screen.getByRole('cell', { name: '23000' });
    const bodyRow1_cell3 = screen.getByRole('cell', { name: '45000' });

    expect(bodyRow1_cell1).toHaveAttribute('class', 'govuk-table__cell  ');
    expect(bodyRow1_cell2).toHaveAttribute(
      'class',
      'govuk-table__cell govuk-table__cell--numeric '
    );
    expect(bodyRow1_cell3).toHaveAttribute(
      'class',
      'govuk-table__cell govuk-table__cell--numeric govuk-!-text-align-right'
    );
  });
});
