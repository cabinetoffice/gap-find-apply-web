export const ExternalApplication = () => {
  return (
    <div>
      <p className="govuk-body">
        Data is gathered from applicants before they are sent to your
        application form.
      </p>
      <p className="govuk-body">
        You may wish to use this data to run due diligence checks.
      </p>

      <p className="govuk-body">
        The data includes: <br />
        <ul>
          <li>name of organisation</li>
          <li>address of organisation</li>
          <li>Companies House number (if they have one)</li>
          <li>Charity Commission number (if they have one)</li>
          <li>how much funding an applicant is applying for</li>
        </ul>
      </p>
    </div>
  );
};
