enum ResponseTypeEnum {
  YesNo = 'YesNo',
  SingleSelection = 'SingleSelection', // currently not used
  Dropdown = 'Dropdown',
  MultipleSelection = 'MultipleSelection',
  ShortAnswer = 'ShortAnswer',
  LongAnswer = 'LongAnswer',
  AddressInput = 'AddressInput',
  Numeric = 'Numeric',
  Date = 'Date',
  SingleFileUpload = 'SingleFileUpload',
}

// this will be used to lookup labels that should be presented to end user, instead of the raw enum value
export const ResponseTypeLabels = {
  YesNo: 'Yes/No',
  SingleSelection: 'Single selection',
  Dropdown: 'Multiple choice',
  MultipleSelection: 'Multiple select',
  ShortAnswer: 'Short answer',
  LongAnswer: 'Long answer',
  AddressInput: 'Address input',
  Numeric: 'Numeric',
  Date: 'Date',
  SingleFileUpload: 'Document upload',
};

export default ResponseTypeEnum;
