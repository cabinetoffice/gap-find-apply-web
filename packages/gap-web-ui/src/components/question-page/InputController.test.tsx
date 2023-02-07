import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import InputController from './InputController';

const customProps = {
  questionTitle: 'Page title',
  questionHintText:
    'A description of the page and the question what it is asking',
  fieldName: 'fieldName',
  fieldErrors: [],
};

describe('Input Controller component', () => {
  it('Renders the Text Input component when the input type is text-input', () => {
    render(
      <InputController
        {...customProps}
        inputType={{
          type: 'text-input',
        }}
      />
    );
    screen.getByTestId('text-input-component');
  });

  it('Renders the Text Area component when the input type is text-area', () => {
    render(
      <InputController
        {...customProps}
        inputType={{
          type: 'text-area',
        }}
      />
    );
    screen.getByTestId('text-area-component');
  });

  it('Renders the checkbox component when the input type is checkboxes', () => {
    render(
      <InputController {...customProps} inputType={{ type: 'checkboxes' }} />
    );
    screen.getByTestId('checkbox-component');
  });

  it('Renders the Radio component when the input type is radio', () => {
    render(<InputController {...customProps} inputType={{ type: 'radio' }} />);
    screen.getByTestId('radioFormDiv');
  });

  it('Renders the Select Input component when the input type is select-input', () => {
    render(
      <InputController
        {...customProps}
        inputType={{
          type: 'select-input',
        }}
      />
    );
    screen.getByTestId('select-input-component');
  });

  it('Renders the Date component when the input type is date', () => {
    render(
      <InputController
        {...customProps}
        inputType={{
          type: 'date',
        }}
      />
    );
    screen.getByTestId('dateGroupDiv');
  });

  it('Renders the UploadFile component when the input type is upload', () => {
    render(
      <InputController
        {...customProps}
        inputType={{
          type: 'upload',
        }}
      />
    );
    screen.getByTestId('uploadFormDiv');
  });

  describe('Spot checks for only rendering the correct input components', () => {
    // We felt it was best to just do "spot checks" here, to establish that only the relevant component is rendered. Anything more than this felt excessive.
    it('Does NOT render other components when the input type is text-area', () => {
      render(
        <InputController
          {...customProps}
          inputType={{
            type: 'text-area',
          }}
        />
      );
      expect(screen.queryByTestId('text-input-component')).toBeFalsy();
    });

    it('Does NOT render other components when the input type is text-input', () => {
      render(
        <InputController
          {...customProps}
          inputType={{
            type: 'text-input',
          }}
        />
      );
      expect(screen.queryByTestId('text-area-component')).toBeFalsy();
    });

    it('Does NOT render other components when the input type is checkboxes', () => {
      render(
        <InputController
          {...customProps}
          inputType={{
            type: 'checkboxes',
          }}
        />
      );
      expect(screen.queryByTestId('text-area-component')).toBeFalsy();
      expect(screen.queryByTestId('text-input-component')).toBeFalsy();
    });

    it('Does NOT render other components when the input type is radio', () => {
      render(
        <InputController
          {...customProps}
          inputType={{
            type: 'radio',
          }}
        />
      );
      expect(screen.queryByTestId('text-area-component')).toBeFalsy();
    });
  });
});
