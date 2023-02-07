import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Details from './Details';
import React from 'react';

describe('Details', () => {
  test('should display', () => {
    render(
      <Details title="test title" text="test text" newLineAccepted={true} />
    );
    screen.getByText('test title');
    screen.getByText('test text');
  });
});
