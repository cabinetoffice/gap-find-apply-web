import { render, screen } from '@testing-library/react';
import { ProcessMultiResponse } from './processMultiResponse';

const multiResponseWithNoEmpty = ['test', 'test1', 'test2'];
const multiResponseWithEmpty = ['test', '', 'test2'];
const multiResponseWithDate = ['01', '10', '2015'];

const componentWithNoEmptyStringInArray = (
  <ProcessMultiResponse
    data={multiResponseWithNoEmpty}
    id={''}
    cyTag={''}
    questionType={'test'}
  />
);
const componentWithEmptyStringInArray = (
  <ProcessMultiResponse
    data={multiResponseWithEmpty}
    id={''}
    cyTag={''}
    questionType={'test'}
  />
);
const componentEmptyData = (
  <ProcessMultiResponse data={''} id={''} cyTag={''} questionType={'test'} />
);
const componentWithCommaSeparatedValues = (
  <ProcessMultiResponse
    data={'comma,separated'}
    id={''}
    cyTag={''}
    questionType={'test'}
  />
);
const componentWithDateArray = (
  <ProcessMultiResponse
    data={multiResponseWithDate}
    id={''}
    cyTag={''}
    questionType={'Date'}
  />
);
describe('should return the correct data for the multiResponse', () => {
  it('should return a hyphen if there is no multiResponse', () => {
    render(componentEmptyData);
    const multiResponse = screen.getByText('-');
    expect(multiResponse).toBeDefined();
    expect(screen.getAllByText('-')).toHaveLength(1);
  });
  it('should return a comma separated list', () => {
    render(componentWithCommaSeparatedValues);
    expect(screen.getByText('comma,')).toBeDefined();
    expect(screen.getByText('separated')).toBeDefined();
  });

  it('should return list if there is an multiResponse', () => {
    render(componentWithNoEmptyStringInArray);
    expect(screen.getByText('test,')).toBeDefined();
    expect(screen.getByText('test1,')).toBeDefined();
    expect(screen.getByText('test2')).toBeDefined();
  });

  it('should return only the non empty field of an multiResponse', () => {
    render(componentWithEmptyStringInArray);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('test,')).toBeDefined();
    expect(screen.getByText('test2')).toBeDefined();
  });

  it('should return an en-UK formatted date string if responseType is Date', () => {
    render(componentWithDateArray);
    expect(screen.getByText('1 October 2015')).toBeDefined();
  });
});
