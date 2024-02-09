import {
  DateInput,
  Radio,
  TextArea,
  TextInput,
  DocumentUpload,
  SelectInput,
  Checkboxes,
} from 'gap-web-ui';
import ResponseTypeEnum from '../../../../../../enums/ResponseType';
import { ApplicationFormQuestion } from '../../../../../../types/ApplicationForm';

const PreviewInputSwitch = (question: ApplicationFormQuestion) => {
  const questionTitle = `${question.fieldTitle}${
    !question.validation.mandatory ? ' (optional)' : ''
  }`;

  const inputProps = {
    questionTitle: questionTitle,
    questionHintText: question.hintText,
    fieldName: 'preview',
    fieldErrors: [],
  };

  const textInputProps = {
    ...inputProps,
    disabled: true,
    defaultValue: 'Applicants will type their answer here',
  };

  switch (question.responseType) {
    case ResponseTypeEnum.ShortAnswer:
      return <TextInput {...textInputProps} />;
    case ResponseTypeEnum.YesNo:
      return <Radio {...inputProps} />;
    case ResponseTypeEnum.LongAnswer:
      return <TextArea {...textInputProps} />;
    case ResponseTypeEnum.Date:
      return <DateInput {...inputProps} disabled={true} />;
    case ResponseTypeEnum.SingleFileUpload:
      return <DocumentUpload {...inputProps} disabled={true} />;
    case ResponseTypeEnum.Dropdown:
      return (
        <SelectInput
          {...inputProps}
          selectOptions={question.options}
          defaultValue={question.options?.[0]}
        />
      );
    case ResponseTypeEnum.MultipleSelection:
      return <Checkboxes {...inputProps} options={question.options} />;
    default:
      throw new Error('Response type could not be mapped to an input');
  }
};

export default PreviewInputSwitch;
