import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import TaskList, { TaskListProps } from './TaskList';

const taskListProps: TaskListProps = {
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
            displayName: 'Complete',
            colourClass: '',
          },
        },
        {
          taskName: 'Task 4',
          taskStatus: {
            displayName: 'Complete',
            colourClass: '',
          },
        },
      ],
    },
  ],
};

const customTaskListProps: TaskListProps = {
  listItems: [
    {
      value: '1. Personal details',
      customSubList: (
        <dl className="govuk-summary-list govuk-!-margin-bottom-9">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">Name</dt>
            <dd className="govuk-summary-list__value">Sarah Philips</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#" data-testid="Change">
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

const component = <TaskList {...taskListProps} />;
const customComponent = <TaskList {...customTaskListProps} />;

describe('Task list component with sub list', () => {
  beforeEach(() => {
    render(component);
  });

  it('Renders the first level list titles', () => {
    screen.getByText('Item 1');
    screen.getByText('Item 2');
  });

  it('Renders all list items in the sub-lists', () => {
    screen.getByText('Task 1');
    screen.getByText('Task 2');
    screen.getByText('Task 3');
    screen.getByText('Task 4');
  });

  it('Renders sub-list links', () => {
    expect(screen.getByRole('link', { name: 'Task 1' })).toHaveAttribute(
      'href',
      '/test'
    );
  });

  it('Renders status tag with correct colour', () => {
    expect(screen.getByText('In Progress')).toHaveClass(
      'govuk-tag--blue govuk-tag'
    );
  });
});

describe('Task list component with custom sub list', () => {
  beforeEach(() => {
    render(customComponent);
  });

  it('Renders the new custom sub list key', () => {
    screen.getByText('Name');
    screen.getByText('Date of birth');
  });

  it('Renders the new custom sub list value', () => {
    screen.getByText('Sarah Philips');
    screen.getByText('5 January 1978');
  });

  it('Renders the new custom sub list link with correct href', () => {
    expect(screen.getByTestId('Change')).toHaveAttribute('href', '#');
  });
});
