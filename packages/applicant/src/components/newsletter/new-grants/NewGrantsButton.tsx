type NewGrantsButtonProps = {
  dateParams: any;
};

export const NewGrantsButton = ({ dateParams }: NewGrantsButtonProps) => {
  return (
    <form action="/grants" method="GET" data-testid="grants-form">
      <input
        type="hidden"
        name="from-day"
        data-testid="from-day"
        value={dateParams.from.day}
      />
      <input
        type="hidden"
        name="from-month"
        data-testid="from-month"
        value={dateParams.from.month}
      />
      <input
        type="hidden"
        name="from-year"
        data-testid="from-year"
        value={dateParams.from.year}
      />

      <input
        type="hidden"
        name="to-day"
        data-testid="to-day"
        value={dateParams.to.day}
      />
      <input
        type="hidden"
        name="to-month"
        data-testid="to-month"
        value={dateParams.to.month}
      />
      <input
        type="hidden"
        name="to-year"
        data-testid="to-year"
        value={dateParams.to.year}
      />

      <button
        type="submit"
        className="govuk-button govuk-button--secondary"
        data-module="govuk-button"
        data-cy="cyViewWeeklyUpdatesButton"
      >
        View Updates
      </button>
    </form>
  );
};
