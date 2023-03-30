import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import TaskList from './TaskList';

export default {
  title: 'gap-web-ui/Task list',
  component: TaskList,
} as ComponentMeta<typeof TaskList>;

const Template: ComponentStory<typeof TaskList> = (args) => (
  <TaskList {...args} />
);

export const Basic = Template.bind({});
Basic.args = {
  listItems: [
    {
      value: 'Item 1',
      subList: [
        {
          taskName: <a href={`/test`}>{'Task 1'}</a>,
          taskStatus: {
            displayName: 'In Progress',
            colourClass: 'govuk-tag--blue',
          },
        },
        {
          taskName: 'Task 2',
          taskStatus: {
            displayName: 'Complete',
            colourClass: '',
          },
        },
      ],
    },
    {
      value: 'Item 2',
      subList: [
        {
          taskName: 'Task 3',
          taskStatus: {
            displayName: 'Not started',
            colourClass: 'govuk-tag--grey',
          },
        },
        {
          taskName: 'Task 4',
          taskStatus: {
            displayName: 'Not started',
            colourClass: 'govuk-tag--grey',
          },
        },
      ],
    },
  ],
};

export const CustomSubList = Template.bind({});
CustomSubList.args = {
  listItems: [
    {
      value: '1. Personal details',
      customSubList: (
        <dl className="govuk-summary-list govuk-!-margin-bottom-9">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Name</dt>
            <dd className="govuk-summary-list__value">Sarah Philips</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#">
                Change<span className="govuk-visually-hidden"> name</span>
              </a>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Date of birth</dt>
            <dd className="govuk-summary-list__value">5 January 1978</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#">
                Change
                <span className="govuk-visually-hidden"> date of birth</span>
              </a>
            </dd>
          </div>
        </dl>
      ),
    },

    {
      value: '2. Application details',
      customSubList: (
        <dl className="govuk-summary-list govuk-!-margin-bottom-9">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              Previous application number
            </dt>
            <dd className="govuk-summary-list__value">502135326</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#">
                Change
                <span className="govuk-visually-hidden">
                  {' '}
                  previous application number
                </span>
              </a>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Licence type</dt>
            <dd className="govuk-summary-list__value">For personal use</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#">
                Change
                <span className="govuk-visually-hidden"> licence type</span>
              </a>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Home address</dt>
            <dd className="govuk-summary-list__value">
              72 Guild Street
              <br />
              London
              <br />
              SE23 6FH
            </dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#">
                Change
                <span className="govuk-visually-hidden"> home address</span>
              </a>
            </dd>
          </div>
        </dl>
      ),
    },
  ],
};
