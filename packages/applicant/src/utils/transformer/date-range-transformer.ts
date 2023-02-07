import moment from 'moment';
import { DateValidationError } from './date-range-transformer.errors';

interface QueryDate {
  day: string;
  month: string;
  year: string;
}
export function transformQueryDateToMoment(
  queryDate: QueryDate,
  fieldName: string
): moment.Moment {
  const error = new DateValidationError(``);
  error.fieldName = fieldName;

  //Check date components are present
  let missingComponents = false;
  if (!queryDate.day) {
    error.message = `${fieldName} date must include the day`;
    error.fields.day = true;
    missingComponents = true;
  }
  if (!queryDate.month) {
    if (error.message) {
      error.message = error.message + ' and the month';
    } else {
      error.message = `${fieldName} date must include the month`;
    }
    error.fields.month = true;
    missingComponents = true;
  }
  if (!queryDate.year) {
    if (error.message) {
      error.message = error.message + ' and the year';
    } else {
      error.message = `${fieldName} date must include the year`;
    }
    error.fields.year = true;
    missingComponents = true;
  }

  if (missingComponents) {
    throw error;
  }

  //Check date components format
  if (queryDate.day.length > 2) {
    error.message = `${fieldName} date day must be in D or DD format`;
    error.fields.day = true;
    throw error;
  }
  if (queryDate.month.length > 2) {
    error.message = `${fieldName} date month must be in M or MM format`;
    error.fields.month = true;
    throw error;
  }
  if (queryDate.year.length !== 4) {
    error.message = `${fieldName} date year must be in YYYY format`;
    error.fields.year = true;
    throw error;
  }

  // Convert components to moment date and validate
  const momentDate = moment({
    year: +queryDate.year,
    month: +queryDate.month,
    day: +queryDate.day,
  });

  if (!momentDate.isValid()) {
    switch (momentDate.invalidAt()) {
      case 0:
        error.message = `${fieldName} date must include a real year`;
        error.fields.year = true;
        throw error;

      case 1:
        error.message = `${fieldName} date must include a real month`;
        error.fields.month = true;
        throw error;

      case 2:
        error.message = `${fieldName} date must include a real day`;
        error.fields.day = true;
        throw error;

      case -1:
      default:
        error.message = `${fieldName} date must be a real date`;
        error.fields.day = true;
        error.fields.month = true;
        error.fields.year = true;
        throw error;
    }
  }

  return momentDate;
}
