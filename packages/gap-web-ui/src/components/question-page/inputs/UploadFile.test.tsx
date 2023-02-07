import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import UploadFile, { UploadProps } from './UploadFile';

const props: UploadProps = {
  questionTitle: 'Title',
  fieldErrors: [],
  fieldName: 'file',
  deleteUrl: '',
};

describe('UploadFile component', () => {
  describe('UploadFile no-errors scenarios', () => {
    test('should display Title', () => {
      render(<UploadFile {...props} />);

      screen.getByRole('heading', {
        name: /title/i,
      });
    });
    test('should display upload a file when no uploadedFile is passed', () => {
      render(<UploadFile {...props} />);

      screen.getByText(/upload a file/i);
    });

    test('should display uploadedfile when uploadedFile is passed', () => {
      render(
        <UploadFile
          {...props}
          uploadedFile={{
            name: 'file.txt',
            removeBaseUrl: '/test',
            id: '1234',
          }}
        />
      );

      screen.getByText(/uploaded file/i);
    });

    test('should display upload input and hidden input when no uploadedFile is passed', () => {
      render(<UploadFile {...props} />);

      const input = screen.getByTestId('file-upload-input');
      const hiddenInput = screen.getByTestId('pre-upload-hidden-input');
      expect(input).toHaveClass('govuk-file-upload');
      expect(input).not.toHaveClass('govuk-file-upload--error');
      expect(input).toHaveAttribute('id', props.fieldName);
      expect(input).toHaveAttribute('type', 'file');
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveAttribute('name', 'pre-upload');
    });

    test('should display summaryList when uploadedFile is passed', () => {
      render(
        <UploadFile
          {...props}
          uploadedFile={{
            name: 'file.txt',
            removeBaseUrl: '/test',
            id: '1234',
          }}
          deleteUrl={'/test/1234'}
        />
      );

      const fileName = screen.getAllByText(/file.txt/);
      const remove = screen.getByRole('link', {
        name: /remove file/i,
      });
      expect(fileName).toHaveLength(2);
      expect(fileName[0]).toHaveClass('govuk-summary-list__value');
      expect(fileName[1]).toHaveClass('govuk-visually-hidden');
      expect(remove).toHaveAttribute('href', '/test/1234');
    });

    test('should display Description if passed', () => {
      render(<UploadFile {...props} questionHintText={'test description'} />);

      screen.getByText(/test description/i);
    });

    test('should not display Error if fieldError is empty', () => {
      render(<UploadFile {...props} />);

      const uploadFormDiv = screen.getByTestId('uploadFormDiv');
      expect(uploadFormDiv).toHaveClass('govuk-form-group');
      expect(uploadFormDiv).not.toHaveClass('govuk-form-group--error');
    });

    describe('UploadFile errors scenarios', () => {
      test('should display Error if fieldError is not empty and no Updated file has been passed', () => {
        const propsWithError: UploadProps = {
          ...props,
          fieldErrors: [
            { fieldName: props.fieldName, errorMessage: 'Error Message' },
          ],
        };
        render(<UploadFile {...propsWithError} />);

        const uploadFormDiv = screen.getByTestId('uploadFormDiv');

        screen.getByText(/error message/i);
        screen.getByTestId(`error-message-test-id`);
        const input = screen.getByTestId('file-upload-input');
        expect(uploadFormDiv).toHaveClass('govuk-form-group--error');
        expect(input).toHaveClass('govuk-file-upload--error');
      });
      test('should display Error if fieldError is not empty and Updated file has been passed', () => {
        const propsWithError: UploadProps = {
          ...props,
          uploadedFile: {
            name: 'updatedFile',
            removeBaseUrl: '/test',
            id: '1234',
          },
          fieldErrors: [
            { fieldName: props.fieldName, errorMessage: 'Error Message' },
          ],
        };
        render(<UploadFile {...propsWithError} />);

        const uploadFormDiv = screen.getByTestId('uploadFormDiv');

        screen.getByText(/error message/i);
        screen.getByTestId(`error-message-test-id`);
        expect(uploadFormDiv).toHaveClass('govuk-form-group--error');
      });
    });
  });
});
