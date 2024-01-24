import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Table, { Row, TableProps, TheadColumn } from './Table';

const mockRows: Row[] = [
  {
    cells: [
      {
        content: 'January',
      },
      {
        content: '23000',
        cellAttributes: {
          'custom-attribute': 'test-data-cy-attribute',
        },
      },
      {
        content: '45000',
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
      },
      {
        content: '15000',
      },
    ],
  },
];

const mockHeadColumns: TheadColumn[] = [
  {
    name: 'Month you apply',
    width: 'one-third',
  },
  {
    name: 'Rate for bicycles',
    isNumber: true,
    theadColumnAttributes: {
      'custom-attribute': 'test-data-cy-attribute',
    },
  },
  {
    name: 'Rate for vehicles',
    isNumber: true,
    isVisuallyHidden: true,
    width: 'full',
  },
];

const customProps: TableProps = {
  caption: 'Test Caption',
  captionSize: 'm',
  tHeadColumns: mockHeadColumns,
  rows: mockRows,
  tableAttributes: {
    'custom-attribute': 'test-data-cy-attribute',
  },
  forceCellTopBorder: true,
};

describe('Table component', () => {
  describe('Table root', () => {
    it('Renders a caption', () => {
      render(<Table {...customProps} />);
      screen.getByRole('table', { name: 'Test Caption' });
    });

    it('Does not render a caption when caption isnt provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { caption, captionSize, ...propsWithoutCaption } = customProps;
      render(<Table {...propsWithoutCaption} />);
      expect(screen.queryByTestId('table-caption')).toBeNull();
    });

    it('Does NOT have a caption size by default', () => {
      render(<Table {...customProps} captionSize={undefined} />);
      expect(screen.getByTestId('table-caption')).not.toHaveClass(
        'govuk-table__caption--m'
      );
    });

    it('Applies a custom passed in caption size', () => {
      render(<Table {...customProps} />);
      expect(screen.getByTestId('table-caption')).toHaveClass(
        'govuk-table__caption--m'
      );
    });

    it('Applies passed in custom attributes for the root table', () => {
      render(<Table {...customProps} />);
      const rootTableElement = screen.getByRole('table', {
        name: 'Test Caption',
      });

      expect(rootTableElement).toHaveAttribute(
        'custom-attribute',
        'test-data-cy-attribute'
      );
    });
  });

  describe('Table headers', () => {
    it('Renders the heading row', () => {
      render(<Table {...customProps} />);
      screen.getByRole('columnheader', { name: 'Month you apply' });
      screen.getByRole('columnheader', { name: 'Rate for bicycles' });
      screen.getByRole('columnheader', { name: 'Rate for vehicles' });
    });

    it('Applies GDS number classname when number is passed in as true for the headers', () => {
      render(<Table {...customProps} />);
      expect(
        screen.getByRole('columnheader', { name: 'Month you apply' })
      ).not.toHaveClass('govuk-table__header--numeric');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for bicycles' })
      ).toHaveClass('govuk-table__header--numeric');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for vehicles' })
      ).toHaveClass('govuk-table__header--numeric');
    });

    it('Applies passed in custom attributes for the table heading cells', () => {
      render(<Table {...customProps} />);
      expect(
        screen.getByRole('columnheader', {
          name: 'Month you apply',
        })
      ).not.toHaveAttribute('custom-attribute');
      expect(
        screen.getByRole('columnheader', {
          name: 'Rate for bicycles',
        })
      ).toHaveAttribute('custom-attribute', 'test-data-cy-attribute');
      expect(
        screen.getByRole('columnheader', {
          name: 'Rate for vehicles',
        })
      ).not.toHaveAttribute('custom-attribute');
    });

    it('Applies GDS width classname when a width is provided', () => {
      render(<Table {...customProps} />);
      expect(
        screen.getByRole('columnheader', { name: 'Month you apply' })
      ).toHaveClass('govuk-!-width-one-third');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for bicycles' })
      ).not.toHaveClass('govuk-!-width-one-third');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for vehicles' })
      ).not.toHaveClass('govuk-!-width-one-third');
    });

    it('Applies GDS visually hidden classname when isVisuallyHidden is true', () => {
      render(<Table {...customProps} />);
      expect(
        screen.getByRole('columnheader', { name: 'Month you apply' })
      ).not.toHaveClass('govuk-visually-hidden');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for bicycles' })
      ).not.toHaveClass('govuk-visually-hidden');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for vehicles' })
      ).toHaveClass('govuk-visually-hidden');
    });

    it('Applies custom gap-thead-static-position classname when isVisuallyHidden is true and width is present', () => {
      render(<Table {...customProps} />);
      expect(
        screen.getByRole('columnheader', { name: 'Month you apply' })
      ).not.toHaveClass('govuk-visually-hidden');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for bicycles' })
      ).not.toHaveClass('govuk-visually-hidden');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for vehicles' })
      ).toHaveClass('govuk-visually-hidden');
      expect(
        screen.getByRole('columnheader', { name: 'Rate for vehicles' })
      ).toHaveClass('gap-thead-static-position');
    });
  });

  describe('Table body', () => {
    it('Applies GDS number classname when number is passed in as true for the cells', () => {
      render(<Table {...customProps} />);
      expect(screen.getByRole('cell', { name: 'January' })).not.toHaveClass(
        'govuk-table__cell--numeric'
      );
      expect(screen.getByRole('cell', { name: '23000' })).toHaveClass(
        'govuk-table__cell--numeric'
      );
      expect(screen.getByRole('cell', { name: '45000' })).toHaveClass(
        'govuk-table__cell--numeric'
      );
    });

    it('Applies passed in custom attributes for the table body cells', () => {
      render(<Table {...customProps} />);
      expect(screen.getByRole('cell', { name: 'January' })).not.toHaveAttribute(
        'custom-attribute'
      );
      expect(screen.getByRole('cell', { name: '23000' })).toHaveAttribute(
        'custom-attribute',
        'test-data-cy-attribute'
      );
      expect(screen.getByRole('cell', { name: '45000' })).not.toHaveAttribute(
        'custom-attribute'
      );
    });

    it('Applies custom gap-table-cell-top-border classname when forceCellTopBorder is true', () => {
      render(<Table {...customProps} />);
      expect(screen.getByRole('cell', { name: 'January' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-!-padding-2  gap-table-cell-top-border'
      );
      expect(screen.getByRole('cell', { name: '23000' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2  gap-table-cell-top-border'
      );
      expect(screen.getByRole('cell', { name: '45000' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2  gap-table-cell-top-border govuk-!-width-full'
      );
    });

    it('Should not apply custom gap-table-cell-top-border classname when forceCellTopBorder is false', () => {
      const props = { ...customProps, forceCellTopBorder: false };
      render(<Table {...props} />);
      expect(screen.getByRole('cell', { name: 'January' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-!-padding-2 '
      );
      expect(screen.getByRole('cell', { name: '23000' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2 '
      );
      expect(screen.getByRole('cell', { name: '45000' })).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2  govuk-!-width-full'
      );
    });
    it('should have the last column aligned to right if alignLastCellToTheRight is true and if the cell is the last column', () => {
      const props = { ...customProps, alignLastCellToTheRight: true };
      render(<Table {...props} />);
      const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });
      const bodyRow1_cell2 = screen.getByRole('cell', { name: '23000' });
      const bodyRow1_cell3 = screen.getByRole('cell', { name: '45000' });

      expect(bodyRow1_cell1).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-!-padding-2  gap-table-cell-top-border'
      );
      expect(bodyRow1_cell2).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2  gap-table-cell-top-border'
      );
      expect(bodyRow1_cell3).toHaveAttribute(
        'class',
        'govuk-table__cell govuk-table__cell--numeric govuk-!-padding-2  gap-table-cell-top-border govuk-!-text-align-right govuk-!-width-full'
      );
    });

    it('should have the data-cy tag as expected when caption is present', () => {
      render(<Table {...customProps} />);
      const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });

      expect(bodyRow1_cell1).toHaveAttribute(
        'data-cy',
        'cy_table_row-for-Test Caption-row-0-cell-0'
      );
    });

    it('should have the data-cy tag as expected when caption is not present', () => {
      const props = { ...customProps, caption: '' };
      render(<Table {...props} />);
      const bodyRow1_cell1 = screen.getByRole('cell', { name: 'January' });

      expect(bodyRow1_cell1).toHaveAttribute(
        'data-cy',
        'cy_table_row-for-Month you apply-row-0-cell-0'
      );
    });
  });
});
