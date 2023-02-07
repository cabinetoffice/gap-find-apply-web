type TextInputSubtype = 'email' | 'nationalInsuranceNumber' | 'numeric';

type SelectType = {
  type: 'select-input';
  defaultValue?: string;
  selectOptions?: string[];
};

type TextInput = {
  type: 'text-input';
  defaultValue?: string;
  textInputSubtype?: TextInputSubtype;
};

type TextArea = {
  type: 'text-area';
  defaultValue?: string;
  limit?: number;
  limitWords?: boolean;
  rows?: number;
};

type RadioInput = {
  type: 'radio';
  defaultChecked?: string;
  radioOptions?: RadioOption[];
};

type RadioOption = {
  label: string;
  value?: string;
  // eslint-disable-next-line no-undef
  hint?: string | JSX.Element;
  // eslint-disable-next-line no-undef
  conditionalInput?: JSX.Element;
};

type CheckboxesInput = {
  type: 'checkboxes';
  options?: string[];
  defaultCheckboxes?: string[];
};

type DateValues = {
  day: string;
  month: string;
  year: string;
};

type DateInputType = {
  type: 'date';
  defaultValues?: DateValues;
};

type DefaultAddressValueType = {
  addressLine1?: string;
  addressLine2?: string;
  town?: string;
  county?: string;
  postcode?: string;
};

type AddressInputType = {
  type: 'address';
  defaultAddressValues?: DefaultAddressValueType;
  hiddenValue?: string;
};

export interface FileType {
  name: string;
  removeBaseUrl: string;
  id: string;
}

type UploadFileType = {
  type: 'upload';
  uploadedFile?: FileType;
  deleteUrl?: string;
};

type InputType =
  | TextInput
  | TextArea
  | RadioInput
  | CheckboxesInput
  | SelectType
  | DateInputType
  | AddressInputType
  | UploadFileType;

export type {
  InputType,
  TextInputSubtype,
  DateValues,
  RadioOption,
  DefaultAddressValueType,
};
