import { useEffect } from 'react';
import { DatePickerDialog } from './DatePickerLib';
export const DatePicker = ({ fieldName }) => {
  useEffect(() => {
    const $datePickerEl = document.querySelector(`.${fieldName}`);
    if ($datePickerEl && DatePickerDialog !== undefined) {
      DatePickerDialog($datePickerEl, fieldName);
    }
  });
  return (
    <div className="datepicker">
      <div className="group govuk-date-input__item">
        <button
          type="button"
          className="icon"
          aria-label={`Select ${fieldName} date`}
          data-cy={`cyDatePicker-${fieldName}`}
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5zM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zM9.5 7h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm3 0h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zM2 10.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1zm3.5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5z" />
            </svg>
          </span>
        </button>
      </div>

      <div
        id={`${fieldName}-datepicker`}
        className="datepicker-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Choose ${fieldName} date`}
        data-cy={`cyDatePicker-${fieldName}Modal`}
      >
        <div className="header">
          <button
            type="button"
            className="prev-year"
            aria-label="previous year"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-chevron-double-left"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
                <path
                  fillRule="evenodd"
                  d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </span>
          </button>

          <button
            type="button"
            className="prev-month"
            aria-label="previous month"
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </span>
          </button>

          <h2
            id={`${fieldName}-grid-label`}
            className="month-year"
            aria-live="polite"
          >
            February 2020
          </h2>

          <button type="button" className="next-month" aria-label="next month">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </span>
          </button>

          <button type="button" className="next-year" aria-label="next year">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"
                />
                <path
                  fillRule="evenodd"
                  d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </span>
          </button>
        </div>

        <table className="dates">
          <thead>
            <tr>
              <th scope="col" abbr="Sunday">
                Su
              </th>
              <th scope="col" abbr="Monday">
                Mo
              </th>
              <th scope="col" abbr="Tuesday">
                Tu
              </th>
              <th scope="col" abbr="Wednesday">
                We
              </th>
              <th scope="col" abbr="Thursday">
                Th
              </th>
              <th scope="col" abbr="Friday">
                Fr
              </th>
              <th scope="col" abbr="Saturday">
                Sa
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td tabIndex={-1} data-date="2020-02-01">
                1
              </td>
            </tr>
            <tr>
              <td tabIndex={-1} data-date="2020-02-02">
                2
              </td>
              <td tabIndex={-1} data-date="2020-02-03">
                3
              </td>
              <td tabIndex={-1} data-date="2020-02-04">
                4
              </td>
              <td tabIndex={-1} data-date="2020-02-05">
                5
              </td>
              <td tabIndex={-1} data-date="2020-02-06">
                6
              </td>
              <td tabIndex={-1} data-date="2020-02-07">
                7
              </td>
              <td tabIndex={-1} data-date="2020-02-08">
                8
              </td>
            </tr>
            <tr>
              <td tabIndex={-1} data-date="2020-02-09">
                9
              </td>
              <td tabIndex={-1} data-date="2020-02-11">
                11
              </td>
              <td tabIndex={-1} data-date="2020-02-12">
                12
              </td>
              <td tabIndex={-1} data-date="2020-02-10">
                10
              </td>
              <td tabIndex={-1} data-date="2020-02-13">
                13
              </td>
              <td
                tabIndex={0}
                data-date="2020-02-14"
                role="gridcell"
                aria-selected="true"
              >
                14
              </td>
              <td tabIndex={-1} data-date="2020-02-15">
                15
              </td>
            </tr>
            <tr>
              <td tabIndex={-1} data-date="2020-02-16">
                16
              </td>
              <td tabIndex={-1} data-date="2020-02-17">
                17
              </td>
              <td tabIndex={-1} data-date="2020-02-18">
                18
              </td>
              <td tabIndex={-1} data-date="2020-02-19">
                19
              </td>
              <td tabIndex={-1} data-date="2020-02-20">
                20
              </td>
              <td tabIndex={-1} data-date="2020-02-21">
                21
              </td>
              <td tabIndex={-1} data-date="2020-02-22">
                22
              </td>
            </tr>
            <tr>
              <td tabIndex={-1} data-date="2020-02-23">
                23
              </td>
              <td tabIndex={-1} data-date="2020-02-24">
                24
              </td>
              <td tabIndex={-1} data-date="2020-02-25">
                25
              </td>
              <td tabIndex={-1} data-date="2020-02-26">
                26
              </td>
              <td tabIndex={-1} data-date="2020-02-27">
                27
              </td>
              <td tabIndex={-1} data-date="2020-02-28">
                28
              </td>
              <td tabIndex={-1} data-date="2020-02-29">
                29
              </td>
            </tr>
            <tr>
              <td tabIndex={-1} data-date="2020-02-30">
                30
              </td>
              <td tabIndex={-1} data-date="2020-02-31">
                31
              </td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
              <td className="disabled" tabIndex={-1}></td>
            </tr>
          </tbody>
        </table>

        <div className="dialog-ok-cancel-group">
          <button
            className="dialog-button govuk-button govuk-button--secondary"
            value="cancel"
          >
            Cancel
          </button>
          <button
            className="dialog-button govuk-button govuk-button--primary"
            value="ok"
          >
            OK
          </button>
        </div>
        <div className="dialog-message" aria-live="polite"></div>
      </div>
    </div>
  );
};
