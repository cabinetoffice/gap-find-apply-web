import Meta from '../components/layout/Meta';
import { Button, ButtonTypePropertyEnum, Radio, TextArea } from 'gap-web-ui';
import { postSurveyResponse } from '../services/satisfactionSurveyService';
import getConfig from 'next/config';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  const backendUrl = `${
    getConfig().serverRuntimeConfig.backendHost
  }/feedback/add`;
  return {
    props: {
      backendUrl,
    },
  };
};

const Survey = ({ backendUrl }: surveyProps) => {
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
          <form
            onSubmit={(e) => {
              postSurveyResponse(e, backendUrl);
            }}
          >
            <Radio
              TitleTag="h1"
              fieldErrors={[]}
              fieldName="satisfaction"
              questionTitle="Overall, how did you feel about the service you received today?"
              titleSize="s"
              radioOptions={[
                {
                  label: 'Very satisfied',
                  value: '5',
                },
                {
                  label: 'Satisfied',
                  value: '4',
                },
                {
                  label: 'Neither satisfied nor dissatisfied',
                  value: '3',
                },
                {
                  label: 'Dissatisfied',
                  value: '2',
                },
                {
                  label: 'Very dissatisfied',
                  value: '1',
                },
              ]}
            />
            <TextArea
              defaultValue=""
              fieldErrors={[]}
              fieldName="comment"
              questionHintText="Do not include personal or financial information, like your National Insurance number or credit card details"
              questionTitle="How could we improve this service?"
              titleSize="s"
              rows={5}
            />
            <Button text="Send feedback" type={ButtonTypePropertyEnum.Submit} />
          </form>
        </div>
      </div>
    </>
  );
};

type surveyProps = {
  backendUrl: string;
};

export default Survey;
