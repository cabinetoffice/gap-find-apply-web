import {
  DateInput,
  Radio,
  TextArea,
  TextInput,
  SelectInput,
  Checkboxes,
  UploadFile,
} from 'gap-web-ui';
import ResponseTypeEnum from '../../../../../enums/ResponseType';
import { ApplicationFormQuestion } from '../../../../../types/ApplicationForm';
import DisabledAddressInput from '../components/DisabledAddressInput';

const PreviewInputSwitch = (
  props: ApplicationFormQuestion & { disableTextBoxes?: boolean }
) => {
  const questionTitle = `${props.fieldTitle}${
    !props.validation.mandatory ? ' (optional)' : ''
  }`;

  const inputProps = {
    questionTitle: questionTitle,
    questionHintText: props.hintText,
    fieldName: 'preview',
    fieldErrors: [],
  };

  switch (props.responseType) {
    //covers funding amount input
    case ResponseTypeEnum.Numeric:
      return (
        <TextInput
          {...inputProps}
          textInputSubtype={'numeric'}
          disabled={props.disableTextBoxes}
        />
      );
    //covers organisation address input
    case ResponseTypeEnum.AddressInput:
      return (
        <DisabledAddressInput
          {...inputProps}
          disabled={true}
        ></DisabledAddressInput>
      );
    case ResponseTypeEnum.ShortAnswer:
      return <TextInput {...inputProps} disabled={props.disableTextBoxes} />;
    case ResponseTypeEnum.YesNo:
      return <Radio {...inputProps} />;
    case ResponseTypeEnum.LongAnswer:
      return <TextArea {...inputProps} disabled={props.disableTextBoxes} />;
    case ResponseTypeEnum.Date:
      return <DateInput {...inputProps} />;
    case ResponseTypeEnum.SingleFileUpload:
      return <UploadFile {...inputProps} disabled={true} />;
    case ResponseTypeEnum.Dropdown:
      return (
        <SelectInput
          {...inputProps}
          selectOptions={props.options}
          defaultValue={props.options?.[0]}
        />
      );
    case ResponseTypeEnum.MultipleSelection:
      return <Checkboxes {...inputProps} options={props.options} />;
    default:
      throw new Error('Response type could not be mapped to an input');
  }
};

export default PreviewInputSwitch;
