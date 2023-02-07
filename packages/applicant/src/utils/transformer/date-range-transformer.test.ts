import { DateValidationError } from './date-range-transformer.errors';
import { transformQueryDateToMoment } from './date-range-transformer';

describe('transformQueryDateToMoment', () => {
  it('should throw an error if no "day" component is supplied', () => {
    expect.assertions(3);
    const testDate = { day: '', month: '5', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include the day'
    );
    expectedError.fields = {
      day: true,
      month: false,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if no "month" component is supplied', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include the month'
    );
    expectedError.fields = {
      day: false,
      month: true,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if no "year" component is supplied', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '5', year: '' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include the year'
    );
    expectedError.fields = {
      day: false,
      month: false,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if no "day", "month" or "year" component is supplied', () => {
    expect.assertions(3);
    const testDate = { day: '', month: '', year: '' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include the day and the month and the year'
    );
    expectedError.fields = {
      day: true,
      month: true,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "day" format is incorrect', () => {
    expect.assertions(3);
    const testDate = { day: '111', month: '5', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date day must be in D or DD format'
    );
    expectedError.fields = {
      day: true,
      month: false,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "month" format is incorrect', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '555', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date month must be in M or MM format'
    );
    expectedError.fields = {
      day: false,
      month: true,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "year" format is too short', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '5', year: '202' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date year must be in YYYY format'
    );
    expectedError.fields = {
      day: false,
      month: false,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "year" format is too long', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '5', year: '20222' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date year must be in YYYY format'
    );
    expectedError.fields = {
      day: false,
      month: false,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "day" format is not a real day', () => {
    expect.assertions(3);
    const testDate = { day: '35', month: '5', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include a real day'
    );
    expectedError.fields = {
      day: true,
      month: false,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "month" format is not a real month', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '55', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must include a real month'
    );
    expectedError.fields = {
      day: false,
      month: true,
      year: false,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "day" format is not a number', () => {
    expect.assertions(3);
    const testDate = { day: 'ww', month: '5', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must be a real date'
    );
    expectedError.fields = {
      day: true,
      month: true,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "month" format is not a number', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: 'ww', year: '2022' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must be a real date'
    );
    expectedError.fields = {
      day: true,
      month: true,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });

  it('should throw an error if "year" format is not a number', () => {
    expect.assertions(3);
    const testDate = { day: '1', month: '5', year: 'wwww' };
    const fieldName = 'From';

    const expectedError = new DateValidationError(
      'From date must be a real date'
    );
    expectedError.fields = {
      day: true,
      month: true,
      year: true,
    };

    try {
      transformQueryDateToMoment(testDate, fieldName);
    } catch (error) {
      expect(error).toBeInstanceOf(DateValidationError);
      expect(error).toStrictEqual(expectedError);
      expect(error.fields).toStrictEqual(expectedError.fields);
    }
  });
});
