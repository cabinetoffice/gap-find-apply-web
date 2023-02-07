import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import React from 'react';
import RichText, { RichTextProps } from './RichText';

const getProps = (overrides: Partial<RichTextProps> = {}) =>
  merge(
    {
      questionTitle: 'Page title',
      questionHintText:
        'A description of the page and the question what it is asking',
      fieldName: 'fieldName',
      fieldErrors: [],
      value: '',
      setValue: () => '',
      apiKey: '',
      isJsEnabled: true,
    } as RichTextProps,
    overrides
  );

describe('Rich Text component', () => {
  describe('When javascript is enabled', () => {
    it('Renders the provided page title as h1', () => {
      render(<RichText {...getProps()} />);
      screen.getByRole('heading', { name: 'Page title', level: 1 });
    });

    it('Renders the provided page title as h2 when titleTag is h2', () => {
      render(<RichText {...getProps({ TitleTag: 'h2' })} />);
      screen.getByRole('heading', { name: 'Page title', level: 2 });
    });

    it('Renders the title in correct size when titleSize parameter is provided', () => {
      render(<RichText {...getProps({ titleSize: 'm' })} />);
      expect(screen.getByText('Page title')).toHaveClass('govuk-label--m');
    });

    it('Renders a page description when a description is provided', () => {
      render(<RichText {...getProps()} />);
      screen.getByText(
        'A description of the page and the question what it is asking'
      );
    });

    it('Does NOT render a page description when a description is not provided', () => {
      render(<RichText {...getProps({ questionHintText: '' })} />);
      expect(
        screen.queryByText(
          'A description of the page and the question what it is asking'
        )
      ).toBeFalsy();
    });

    it('Should NOT render a text area component', () => {
      render(<RichText {...getProps()} />);
      expect(screen.queryByRole('textbox', { name: 'Page title' })).toBeFalsy();
    });

    it('Should have gap-new-line class in the hintText when newLineClass is true', () => {
      render(<RichText {...getProps({ newLineAccepted: true })} />);
      expect(
        screen.queryByText(
          'A description of the page and the question what it is asking'
        )
      ).toHaveClass('gap-new-line');
    });
  });

  describe('When javascript is disabled', () => {
    const getJSDisabledProps = (overrides: Partial<RichTextProps> = {}) =>
      merge(getProps({ isJsEnabled: false }), overrides);

    it('Should have jsDisabled as hidden input', () => {
      render(<RichText {...getJSDisabledProps()} />);
      expect(screen.getByTestId('jsDisabled')).toHaveAttribute(
        'type',
        'hidden'
      );
    });

    it('Renders the provided page title as h1', () => {
      render(<RichText {...getJSDisabledProps()} />);
      screen.getByRole('heading', { name: 'Page title', level: 1 });
    });

    it('Renders the provided page title as h2 when titleTag is h2', () => {
      render(<RichText {...getJSDisabledProps({ TitleTag: 'h2' })} />);
      screen.getByRole('heading', { name: 'Page title', level: 2 });
    });

    it('Renders the title in correct size when titleSize parameter is provided', () => {
      render(<RichText {...getJSDisabledProps({ titleSize: 'm' })} />);
      expect(screen.getByText('Page title')).toHaveClass('govuk-label--m');
    });

    it('Renders a page description when a description is provided', () => {
      render(<RichText {...getJSDisabledProps()} />);
      screen.getByText(
        'A description of the page and the question what it is asking'
      );
    });

    it('Should render a text area component', () => {
      render(<RichText {...getJSDisabledProps()} />);
      screen.getByRole('textbox', { name: 'Page title' });
    });
  });

  describe('Error cases', () => {
    const fieldErrorProp = {
      fieldErrors: [
        {
          fieldName: 'fieldName',
          errorMessage: 'This field is required.',
        },
      ],
    };

    it('Renders a field error when an error is provided', () => {
      render(<RichText {...getProps(fieldErrorProp)} />);
      screen.getByTestId('error-message-test-id');
    });

    it('Renders a red border to the left of the input area', () => {
      render(<RichText {...getProps(fieldErrorProp)} />);
      expect(screen.getByTestId('rich-text-component')).toHaveClass(
        'govuk-form-group--error'
      );
    });

    it('Does NOT render a field error when no error is provided', () => {
      render(<RichText {...getProps()} />);

      expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
    });
  });
});
