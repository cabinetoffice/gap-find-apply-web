import Meta from '../../components/layout/Meta';
import {
  Button,
  ButtonTypePropertyEnum,
  ErrorBanner,
  Radio,
  TextArea,
  ValidationError,
} from 'gap-web-ui';
import { postSurveyResponse } from '../../services/SatisfactionSurveyService';
import getConfig from 'next/config';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSessionIdFromCookies } from '../../utils/session';
// import { AxiosError } from 'axios';
// import { generateErrorPageRedirectV2 } from '../../utils/serviceErrorHelpers';
// import CustomError from '../../types/CustomError';

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const fieldErrors: ValidationError[] = query.fieldErrors
    ? [JSON.parse(query.fieldErrors as string)]
    : [];

  const sessionId = getSessionIdFromCookies(req);

  const schemeId = 1;

  const backendUrl = `${
    getConfig().serverRuntimeConfig.backendHost
  }/feedback/add`;

  return {
    props: {
      backendUrl,
      fieldErrors,
      schemeId,
      sessionId,
    },
  };
};

const Survey = ({
  backendUrl,
  fieldErrors,
  schemeId,
  sessionId,
}: surveyProps) => {
  const router = useRouter();

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0
            ? `Error - ${fieldErrors[0].errorMessage} - `
            : ''
        }Satisfaction survey - Manage a grant`}
      />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds govuk-!-margin-top-7">
          <h1 className="govuk-heading-l" tabIndex={-1}>
            Give feedback on Manage a grant
          </h1>
          <h2 className="govuk-heading-m" tabIndex={-1}>
            Satisfaction survey
          </h2>
          <ErrorBanner fieldErrors={fieldErrors} />
          <form
            onSubmit={async (e) => {
              try {
                await postSurveyResponse(e, sessionId, backendUrl);
              } catch (e) {
                // TODO: Getting a 200 OK error when submitting - why? All works fine.
                // const error = e as AxiosError;
                // const errorMessageObject = error.response?.data as CustomError;
                // return generateErrorPageRedirectV2(
                //   errorMessageObject.code,
                //   `/scheme/${schemeId}`
                // );
                router.replace(`/scheme/` + schemeId);
              }
              router.replace(`/scheme/` + schemeId);
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
  fieldErrors: ValidationError[];
  schemeId: string;
  sessionId: string;
};

export default Survey;
