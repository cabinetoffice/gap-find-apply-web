import React from 'react';
import { DateValues } from '../../../types/InputType';
import DateInput, { DateInputProps } from './DateInput';
import SelectInput from './SelectInput';

const DateTimeInput = ({
  timeDefaultValues,
  dateDefaultValues,
  fieldName,
  fieldErrors,
  questionTitle,
  ...props
}: DateTimeProps) => {
  console.log('timeDefaultValues ', timeDefaultValues);
  let timeDefaultValue = timeDefaultValues;
  let selectOptions = [
    { label: '1am', value: '01:00' },
    { label: '2am', value: '02:00' },
    { label: '3am', value: '03:00' },
    { label: '4am', value: '04:00' },
    { label: '5am', value: '05:00' },
    { label: '6am', value: '06:00' },
    { label: '7am', value: '07:00' },
    { label: '8am', value: '08:00' },
    { label: '9am', value: '09:00' },
    { label: '10am', value: '10:00' },
    { label: '11am', value: '11:00' },
    { label: 'Midday (12:00 PM)', value: '12:00' },
    { label: '1pm', value: '13:00' },
    { label: '2pm', value: '14:00' },
    { label: '3pm', value: '15:00' },
    { label: '4pm', value: '16:00' },
    { label: '5pm', value: '17:00' },
    { label: '6pm', value: '18:00' },
    { label: '7pm', value: '19:00' },
    { label: '8pm', value: '20:00' },
    { label: '9pm', value: '21:00' },
    { label: '10pm', value: '22:00' },
    { label: '11pm', value: '23:00' },
  ];

  if (fieldName.includes('Open')) {
    selectOptions = [
      { label: 'Midnight (0:01 AM)', value: '00:01' },
      ...selectOptions,
    ];
    timeDefaultValue = !timeDefaultValue
      ? 'Select an opening time'
      : timeDefaultValue;
  } else if (fieldName.includes('Close')) {
    selectOptions = [
      ...selectOptions,
      { label: 'Midnight (11:59 PM)', value: '23:59' },
    ];
    timeDefaultValue = !timeDefaultValue
      ? 'Select a closing time'
      : timeDefaultValue;
  }

  return (
    <>
      <DateInput
        {...props}
        fieldName={fieldName}
        defaultValues={dateDefaultValues}
        questionTitle={questionTitle}
        fieldErrors={fieldErrors.filter(
          (fieldError) => !fieldError.fieldName.includes('-time')
        )}
      />

      <SelectInput
        {...props}
        fieldName={`${fieldName}-time`}
        defaultValue={timeDefaultValue}
        questionTitle={questionTitle?.replace('date', 'time')}
        fieldErrors={fieldErrors}
        questionHintText={null}
        boldHeading={false}
        selectOptions={selectOptions}
      />
    </>
  );
};

export interface DateTimeProps extends DateInputProps {
  timeDefaultValues?: string;
  dateDefaultValues?: DateValues;
  defaultValues?: never;
}

export default DateTimeInput;
