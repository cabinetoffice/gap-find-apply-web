import { useEffect } from 'react';
import { Select } from './SelectInputLib';

type JSSelectProps = {
  label: string;
  options: Array<object>;
  onChange?: () => void;
  initialValue?: string;
};

/**
 * Reusable accessibility focused select/dropdown field styled inline with GDS Select Component.
 * This component requires JS to be enabled so please remember to include a <noscript> alternative along side this component.
 *
 * This is adapted from the w3 accessibility combo box example:
 * https://w3c.github.io/aria-practices/examples/combobox/combobox-select-only.html
 *
 * @param {string} label
 * @param {Array<Object>} options
 * @param {Function} onChange
 * @param {string} initialValue
 * @returns SelectInput component
 */
export const SelectInput = ({
  label,
  options,
  onChange,
  initialValue,
}: JSSelectProps) => {
  useEffect(() => {
    const $select = document.querySelector('.js-select');
    Select($select, options, onChange, initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="govuk-form-group govuk-gap-form-group govuk-!-margin-bottom-0 js-select-div"
      data-testid="js-select"
    >
      <label id="select-label" className="govuk-label gap_results-tools__label">
        {label}
      </label>
      <div className="combo js-select">
        <div
          aria-controls="optionsDiv"
          aria-expanded="false"
          aria-haspopup="listbox"
          aria-labelledby="select-label"
          className="govuk-select combo-input"
          role="combobox"
          tabIndex={0}
        ></div>
        <div
          className="combo-menu"
          role="listbox"
          id="optionsDiv"
          aria-labelledby="select-label"
          tabIndex={-1}
        ></div>
      </div>
    </div>
  );
};
