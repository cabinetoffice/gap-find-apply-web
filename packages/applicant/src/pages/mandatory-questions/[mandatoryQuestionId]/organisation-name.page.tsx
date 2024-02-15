import {
  Button,
  ButtonTypePropertyEnum,
  FlexibleQuestionPageLayout,
  TextInput,
} from 'gap-web-ui';
import Layout from '../../../components/partials/Layout';
import Meta from '../../../components/partials/Meta';
import InferProps from '../../../types/InferProps';
import getServerSideProps from './getServerSideProps';
import { MQ_ORG_TYPES } from '../../../utils/constants';

export { getServerSideProps };
export default function MandatoryQuestionOrganisationNamePage({
  csrfToken,
  fieldErrors,
  formAction,
  defaultFields,
  backButtonUrl,
  mandatoryQuestion,
}: InferProps<typeof getServerSideProps>) {
  let questionTitle, questionHintText;

  switch (mandatoryQuestion.orgType) {
    case MQ_ORG_TYPES.INDIVIDUAL:
      questionTitle = 'Enter your full name';
      questionHintText = 'Your name will appear on your application.';
      break;
    case MQ_ORG_TYPES.LOCAL_AUTHORITY:
      questionTitle = 'Enter the name of your local authority';
      questionHintText =
        'Enter the full name of your local authority. For example "Essex County Council" rather than "Essex"';
      break;
    default:
      questionTitle = 'Enter the name of your organisation';
      break;
  }

  return (
    <>
      <Meta
        title={`${
          fieldErrors.length > 0 ? 'Error: ' : ''
        }Organisation name - Apply for a grant`}
      />

      <Layout backBtnUrl={backButtonUrl}>
        <FlexibleQuestionPageLayout
          formAction={formAction}
          fieldErrors={fieldErrors}
          csrfToken={csrfToken}
        >
          <TextInput
            questionTitle={questionTitle}
            questionHintText={questionHintText}
            fieldName="name"
            defaultValue={defaultFields.name}
            fieldErrors={fieldErrors}
            width="30"
          />

          <Button
            text="Save and continue"
            type={ButtonTypePropertyEnum.Submit}
          />
        </FlexibleQuestionPageLayout>
      </Layout>
    </>
  );
}
