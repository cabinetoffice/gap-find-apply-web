import Meta from '../../../components/layout/Meta';
import { Button, ButtonTypePropertyEnum, Radio, TextArea } from 'gap-web-ui';

const Survey = () => {
  return (
    <>
      <Meta
        title="Satisfaction survey - Manage a grant"
        description="Satisfaction survey - Manage a grant"
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
          <h1 className="govuk-heading-l" tabIndex={-1}>
            Give feedback on Manage a grant
          </h1>
          <h2 className="govuk-heading-m" tabIndex={-1}>
            Satisfaction survey
          </h2>
          <Radio
            TitleTag="h1"
            fieldErrors={[]}
            fieldName="satisfaction"
            questionTitle="Overall, how did you feel about the service you received today?"
            titleSize="s"
            radioOptions={[
              {
                label: 'Very satisfied',
                value: 'verySatisfied',
              },
              {
                label: 'Satisfied',
                value: 'satisfied',
              },
              {
                label: 'Neither satisfied nor dissatisfied',
                value: 'neitherSatisfiedNorDissatisfied',
              },
              {
                label: 'Dissatisfied',
                value: 'dissatisfied',
              },
              {
                label: 'Very dissatisfied',
                value: 'veryDissatisfied',
              },
            ]}
          />
          <TextArea
            defaultValue=""
            fieldErrors={[]}
            fieldName="improvements"
            questionHintText="Do not include personal or financial information, like your National Insurance number or credit card details"
            questionTitle="How could we improve this service?"
            titleSize="s"
            rows={5}
          />
          <Button text="Send feedback" type={ButtonTypePropertyEnum.Submit} />
        </div>
      </div>
    </>
  );
};

export default Survey;
