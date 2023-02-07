import moment from 'moment';

export function dateFormatter(date) {
  const utcDate = moment(date).utc();
  return moment(utcDate).local().format('dddd D MMMM YYYY h:mm a');
}

/**
 * Takes a date time object and formats it for use in sentences.
 * For example the datetime '2022-03-25 13:32:45+00' would be formatted to '25 March 2022 at 1.32pm'.
 *
 * Note that the output of this function is converted to the user's local timezone.
 * @param {Date} date
 * @returns a GDS formatted date time
 */
export function formatDateTimeForSentence(date) {
  const utcDate = moment(date).utc();
  const dateSection = moment(utcDate).local().format('D MMMM YYYY');
  const timeSection = moment(utcDate).local().format('h:mma');

  return `${dateSection} at ${timeSection}`;
}
