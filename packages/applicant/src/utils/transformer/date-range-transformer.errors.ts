interface DateValidationErrorFields {
  day: boolean;
  month: boolean;
  year: boolean;
}

export class DateValidationError extends Error {
  public fields: DateValidationErrorFields;
  public fieldName: string;
  constructor(message) {
    super(message);
    this.fields = {
      day: false,
      month: false,
      year: false,
    };
  }
}
