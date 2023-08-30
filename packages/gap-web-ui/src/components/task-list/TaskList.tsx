import React from 'react';
import styles from './TaskList.module.scss';

export interface TaskListProps {
  listItems: ListItem[];
}

export interface ListItem {
  value: string | JSX.Element;
  subList?: SubListItem[];
  customSubList?: JSX.Element;
}

export interface SubListItem {
  taskName: string | JSX.Element;
  taskStatus: StatusTag;
}

export interface StatusTag {
  displayName: string;
  colourClass: string;
}

const TaskList = ({ listItems }: TaskListProps) => {
  return (
    <ol className={styles['app-task-list']}>
      {listItems &&
        listItems.map((listItem, listItemIndex) => {
          return (
            <li key={listItemIndex}>
              <h2
                className={styles['app-task-list__section']}
                data-cy={`cy-task-list-heading-${listItem.value}`}
              >
                {listItem.value}
              </h2>
              {listItem.customSubList && listItem.customSubList}
              <ul className={styles['app-task-list__items']}>
                {listItem.subList &&
                  listItem.subList.map((subListItem, subListItemIndex) => {
                    return (
                      <li
                        className={styles['app-task-list__item']}
                        key={subListItemIndex}
                      >
                        <>
                          <span className={styles['app-task-list__task-name']}>
                            {subListItem.taskName}
                          </span>
                          <strong
                            className={
                              styles['app-task-list__tag'] +
                              ` govuk-tag ${subListItem.taskStatus.colourClass}`
                            }
                            data-cy={`cy-${listItem.value}-sublist-task-status-${subListItemIndex}`}
                          >
                            {subListItem.taskStatus.displayName}
                          </strong>
                        </>
                      </li>
                    );
                  })}
              </ul>
            </li>
          );
        })}
    </ol>
  );
};

export default TaskList;
