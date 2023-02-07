import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import Table from './Table';

export default {
  title: 'gap-web-ui/Table',
  component: Table,
} as ComponentMeta<typeof Table>;

const Template: ComponentStory<typeof Table> = (args) => <Table {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  caption: 'Dates and amounts',
  tHeadColumns: [{ name: 'Date' }, { name: 'Amount' }],
  rows: [
    {
      cells: [{ content: 'First 6 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Next 33 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Total estimated pay' }, { content: '	£4,282.20' }],
    },
  ],
};

export const VisuallyHiddenHeader = Template.bind({});
VisuallyHiddenHeader.args = {
  forceCellTopBorder: true,
  caption: 'Dates and amounts',
  tHeadColumns: [{ name: 'Date' }, { name: 'Amount', isVisuallyHidden: true }],
  rows: [
    {
      cells: [{ content: 'First 6 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Next 33 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Total estimated pay' }, { content: '£4,282.20' }],
    },
  ],
};

export const CustomColWidths = Template.bind({});
CustomColWidths.args = {
  caption: 'Dates and amounts',
  tHeadColumns: [{ name: 'Date', width: 'two-thirds' }, { name: 'Amount' }],
  rows: [
    {
      cells: [{ content: 'First 6 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Next 33 weeks' }, { content: '£109.80 per week' }],
    },
    {
      cells: [{ content: 'Total estimated pay' }, { content: '£4,282.20' }],
    },
  ],
};

export const CellsWithNumbers = Template.bind({});
CellsWithNumbers.args = {
  caption: 'Months and rates',
  captionSize: 'xl',
  tHeadColumns: [
    { name: 'Month you apply' },
    { name: 'Rate for bicycles', isNumber: true },
    { name: 'Rate for vehicles', isNumber: true },
  ],
  rows: [
    {
      cells: [{ content: 'January' }, { content: '£85' }, { content: '£95' }],
    },
    {
      cells: [{ content: 'February' }, { content: '£75' }, { content: '£55' }],
    },
    {
      cells: [{ content: 'March' }, { content: '£165' }, { content: '£125' }],
    },
  ],
};

export const VisuallyHiddenAndCustomWidth = Template.bind({});
VisuallyHiddenAndCustomWidth.args = {
  caption: 'Months and rates',
  captionSize: 'xl',
  tHeadColumns: [
    { name: 'Month you apply', isVisuallyHidden: true, width: 'one-half' },
    { name: 'Rate for bicycles', isVisuallyHidden: true, width: 'one-quarter' },
    { name: 'Rate for vehicles', isVisuallyHidden: true, width: 'one-quarter' },
  ],
  rows: [
    {
      cells: [{ content: 'January' }, { content: '£85' }, { content: '£95' }],
    },
    {
      cells: [{ content: 'February' }, { content: '£75' }, { content: '£55' }],
    },
    {
      cells: [{ content: 'March' }, { content: '£165' }, { content: '£125' }],
    },
  ],
};
