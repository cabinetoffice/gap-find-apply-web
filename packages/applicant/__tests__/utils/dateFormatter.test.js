import {
  dateFormatter,
  formatDateTimeForSentence,
} from '../../src/utils/dateFormatterGDS';

describe('For use of formatting dates to be GDS compliant', () => {
  it('should give a correct format date when passed a timestamp', () => {
    let date = '2022-03-25 13:32:45+00';
    let result = 'Friday 25 March 2022 1:32 pm';
    expect(dateFormatter(date)).toEqual(result);
  });
});

describe('formatDateTimeForSentence', () => {
  it('should format a date time object correctly', () => {
    let date = '2022-03-25 13:32:45+00';
    let result = '25 March 2022 at 1:32pm';
    expect(formatDateTimeForSentence(date)).toEqual(result);
  });
});
