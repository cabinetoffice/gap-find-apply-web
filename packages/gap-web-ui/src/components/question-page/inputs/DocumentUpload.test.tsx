import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { merge } from 'lodash';
import DocumentUpload from './DocumentUpload';

const props = (overrides: any = {}) =>
  merge(
    {
      questionTitle: 'Page title',
      questionHintText:
        'A description of the page and the question what it is asking',
      fieldName: 'fieldName',
      fieldErrors: [],
    },
    overrides
  );

describe('Document Upload component', () => {
  it('Should NOT add a govuk-form-group--error className when there are no fieldErrors', () => {
    render(<DocumentUpload {...props()} />);
    expect(screen.getByTestId('document-upload')).not.toHaveClass(
      'govuk-form-group--error'
    );
  });

  it('Should add a govuk-form-group--error className when there are fieldErrors', () => {
    render(
      <DocumentUpload
        {...props({
          fieldErrors: [{ fieldName: 'fieldName', errorMessage: 'Error' }],
        })}
      />
    );
    expect(screen.getByTestId('document-upload')).toHaveClass(
      'govuk-form-group--error'
    );
  });

  it('Should render a question title', () => {
    render(<DocumentUpload {...props()} />);
    screen.getByRole('heading', { name: 'Page title' });
  });

  it('Should render a question title with the provided titleSize', () => {
    render(<DocumentUpload {...props({ titleSize: 's' })} />);
    expect(screen.getByText('Page title')).toHaveClass('govuk-label--s');
  });

  it('Should render a question hint when a questionHintText is provided', () => {
    render(<DocumentUpload {...props()} />);
    screen.getByText(
      'A description of the page and the question what it is asking'
    );
  });

  it('Should render a label with the relevant accepted doc types', () => {
    render(<DocumentUpload {...props()} />);
    screen.getByText(
      'Upload a file (Allows files that are .DOC, .DOCX, .ODT, .PDF, .XLS, .XLSX or .ZIP)'
    );
  });

  it('Should NOT render an error message when there are no field errors', () => {
    render(<DocumentUpload {...props()} />);
    expect(screen.queryByTestId('error-message-test-id')).toBeFalsy();
  });

  it('Should render an error message when there are field errors', () => {
    render(
      <DocumentUpload
        {...props({
          fieldErrors: [{ fieldName: 'fieldName', errorMessage: 'Error' }],
        })}
      />
    );
    screen.getByTestId('error-message-test-id');
  });

  it('Should render an upload input', () => {
    render(<DocumentUpload {...props()} />);
    screen.getByTestId('document-upload-input-fieldName');
  });

  it('Should render an upload input with an error when there are field errors', () => {
    render(
      <DocumentUpload
        {...props({
          fieldErrors: [{ fieldName: 'fieldName', errorMessage: 'Error' }],
        })}
      />
    );
    screen.getByTestId('document-upload-input-fieldName');
    expect(screen.getByTestId('document-upload-input-fieldName')).toHaveClass(
      'govuk-file-upload--error'
    );
  });

  it('Should render a hint explaining it may take some time to upload', () => {
    render(<DocumentUpload {...props()} />);
    screen.getByText(
      'This might take a few minutes if you are uploading a large file. Once your file has been uploaded it will be listed on the screen.'
    );
  });
});
