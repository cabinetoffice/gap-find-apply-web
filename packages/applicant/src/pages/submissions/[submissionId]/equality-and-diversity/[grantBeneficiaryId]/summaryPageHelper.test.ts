import { mapValuesToString } from './summaryPageHelper';

describe('mapValuesToString', () => {
  test('should return string with all the element in the array joined by ", "', () => {
    const array = ['q', 'w', 'e'];
    const result = mapValuesToString(array);
    const expectedResult = 'q, w, e';
    expect(result).toBe(expectedResult);
  });

  test('should return string with - when there are only falsy element in the array', () => {
    const array = ['', '', ''];
    const result = mapValuesToString(array);
    const expectedResult = '–';
    expect(result).toBe(expectedResult);
  });

  test('should return string with only the truthy element in the array joined by ", "', () => {
    const array = ['q', '', 'e', '', 't', 'y'];
    const result = mapValuesToString(array);
    const expectedResult = 'q, e, t, y';
    expect(result).toBe(expectedResult);
  });
});
