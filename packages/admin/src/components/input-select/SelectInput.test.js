import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
const { SelectInput } = require('./SelectInput');

const testOptions = [
  { field: 'First test option', value: 'testOne' },
  { field: 'Second test option', value: 'testTwo' },
];
const mockCallback = jest.fn();
const component = (
  <SelectInput
    label="test select"
    options={testOptions}
    onChange={mockCallback}
    initialValue="testTwo"
  />
);

describe('Rendering SelectInput component', () => {
  it('Should render expected elements', () => {
    render(component);
    expect(screen.getByText('test select')).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'test select' })).toBeDefined();
    expect(screen.getByRole('listbox', { name: 'test select' })).toBeDefined();
  });

  it('Should create listbox item for each selectable option', () => {
    render(component);
    const options = screen.getAllByRole('option');
    expect(options[0].innerText).toEqual('First test option');
    expect(options[0]).toHaveAttribute('data-value', 'testOne');

    expect(options[1].innerText).toEqual('Second test option');
    expect(options[1]).toHaveAttribute('data-value', 'testTwo');
  });

  it('Should default to the option which matches initial value', () => {
    render(component);
    const selected = screen.getByRole('combobox', { name: 'test select' });
    expect(selected.innerHTML).toEqual('Second test option');
  });

  it('Should default to the first option if no initial value is provided', () => {
    render(<SelectInput label="test select" options={testOptions} />);
    const selected = screen.getByRole('combobox', { name: 'test select' });
    expect(selected.innerHTML).toEqual('First test option');
  });
});

describe('Handle user input', () => {
  it('Should update selected option when new option is clicked', () => {
    render(component);
    let selected = screen.getByRole('combobox', { name: 'test select' });
    let options = screen.getAllByRole('option');
    expect(selected.innerHTML).toEqual('Second test option');
    userEvent.click(selected);
    userEvent.click(options[0]);
    expect(selected.innerHTML).toEqual('First test option');
    expect(options[0]).toHaveClass('option-current');
    expect(options[1]).not.toHaveClass('option-current');
  });

  it('Should trigger callback if provided when option is changed', () => {
    render(component);
    let selected = screen.getByRole('combobox', { name: 'test select' });
    expect(selected.innerHTML).toEqual('Second test option');
    userEvent.click(selected);
    userEvent.click(screen.getAllByRole('option')[0]);
    expect(mockCallback).toHaveBeenCalled();
  });

  it('Should allow keyboard users to update options', () => {
    render(component);
    let comboboxInput = screen.getByRole('combobox', { name: 'test select' });
    let options = screen.getAllByRole('option');
    expect(comboboxInput.innerHTML).toEqual('Second test option');
    fireEvent.keyDown(comboboxInput, {
      key: 'Enter',
      keyCode: 13,
      charCode: 13,
    });
    expect(comboboxInput).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(comboboxInput, {
      key: 'ArrowUp',
      keyCode: 38,
      charCode: 38,
    });
    expect(options[0]).toHaveClass('option-current');
    fireEvent.keyDown(comboboxInput, {
      key: 'Enter',
      keyCode: 13,
      charCode: 13,
    });
    expect(comboboxInput).toHaveAttribute('aria-expanded', 'false');
    expect(comboboxInput.innerHTML).toEqual('First test option');
    expect(mockCallback).toHaveBeenCalled();
  });
});
