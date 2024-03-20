import { TextInput } from 'gap-web-ui';
import { InputComponentProps } from 'gap-web-ui/dist/cjs/components/question-page/inputs/InputComponentProps';

const DisabledAddressInput = ({
  questionTitle,
  titleSize = 'l',
  questionHintText,
  fieldName,
  hiddenValue,
  disabled,
}: DisabledAddressInputProps) => {
  return (
    <fieldset className="govuk-fieldset">
      <legend
        className={`govuk-fieldset__legend govuk-fieldset__legend--${titleSize}`}
        data-testid="title-legend"
      >
        <h1
          className="govuk-fieldset__heading"
          data-cy={`cy-${fieldName}-question-title`}
        >
          {questionTitle}
        </h1>
      </legend>
      {questionHintText && (
        <div
          id={`${fieldName}-hint`}
          className="govuk-hint"
          data-cy={`cy-${fieldName}-question-hint`}
        >
          {questionHintText}
        </div>
      )}

      {hiddenValue && hiddenValue.length > 0 && (
        <input type="hidden" value={hiddenValue} name="id" />
      )}

      <TextInput
        questionTitle="Address line 1"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-address-line-1`}
        fieldErrors={[]}
        disabled={disabled}
      />

      <TextInput
        questionTitle="Address line 2 (optional)"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-address-line-2`}
        fieldErrors={[]}
        disabled={disabled}
      />

      <TextInput
        questionTitle="Town or City"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-town`}
        fieldErrors={[]}
        width="20"
        disabled={disabled}
      />

      <TextInput
        questionTitle="County (optional)"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-county`}
        fieldErrors={[]}
        width="20"
        disabled={disabled}
      />

      <TextInput
        questionTitle="Postcode"
        boldHeading={false}
        titleSize="s"
        fieldName={`${fieldName}-postcode`}
        fieldErrors={[]}
        width="10"
        disabled={disabled}
      />
    </fieldset>
  );
};

export interface DisabledAddressInputProps extends InputComponentProps {
  hiddenValue?: string;
  disabled: true;
}

export default DisabledAddressInput;
