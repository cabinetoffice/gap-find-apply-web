export const mapValuesToString = (array: any[]) => {
  const filteredArray = array.filter((value) => value);
  return filteredArray.length === 0 ? '–' : filteredArray.join(', ');
};
